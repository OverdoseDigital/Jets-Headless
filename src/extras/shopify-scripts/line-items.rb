# Discount tag prefix applied to products eg. `discount:buy2save10%`
DISCOUNT_TAG_PREFIX = 'discount:'

# Discount keywords
DISCOUNT_BUY = 'buy'
DISCOUNT_SPEND = 'spend'
DISCOUNT_SAVE = 'save'
DISCOUNT_FOR = 'for'

# Discount types
DISCOUNT_TYPE_SPEND = 'spend'
DISCOUNT_TYPE_QUANTITY = 'quantity'
DISCOUNT_TYPE_PERCENT = 'percent'
DISCOUNT_TYPE_DOLLARS = 'dollars'

all_discounts = {}

def change_line_item_price_min_max (line_item, price, message)
  new_price = price
  if new_price < Money.zero
    new_price = Money.zero
  elsif new_price > line_item.line_price
    new_price = line_item.line_price
  end
  line_item.change_line_price(new_price, {message: message})
end

def discount_line_item_percentage (line_item, percentage, quantity, message)
  if quantity < line_item.quantity
    single_item_price = line_item.line_price * (1 / line_item.quantity)
    discounted_items_price = single_item_price * quantity * percentage
    full_priced_items_price = single_item_price * (line_item.quantity - quantity)
    new_line_item_price = discounted_items_price + full_priced_items_price
  else
    new_line_item_price = line_item.line_price * percentage
  end
  change_line_item_price_min_max(line_item, new_line_item_price, message)
end

def discount_line_item_by_amount (line_item, amount, message)
  new_line_item_price = line_item.line_price - amount
  change_line_item_price_min_max(line_item, new_line_item_price, message)
end

def discount_line_item_to_amount (line_item, amount, quantity, message)
  if quantity < line_item.quantity
    single_item_price = line_item.line_price * (1 / line_item.quantity)
    full_priced_items_price = single_item_price * (line_item.quantity - quantity)
    new_line_item_price = full_priced_items_price + amount
  else
    new_line_item_price = amount
  end
  change_line_item_price_min_max(line_item, new_line_item_price, message)
end

Input.cart.line_items.each do |line_item|
  next if line_item.properties.key?('_gwp')
  discount_tags = line_item.variant.product.tags.select do |tag|
    tag.start_with?(DISCOUNT_TAG_PREFIX)
  end
  next if discount_tags.empty?

  discount_tags.each do |tag|
    if !all_discounts.key?(tag)
      all_discounts[tag] = []
    end
    all_discounts[tag].push(line_item)
  end
end

all_discounts.each do |discount_tag, line_items|
  discount = discount_tag.sub(DISCOUNT_TAG_PREFIX, '').split(':')
  discount_details = discount.first.downcase.sub(DISCOUNT_BUY, '').sub(DISCOUNT_SPEND, '')
  discount_details_parts = discount_details.include?(DISCOUNT_SAVE) ? discount_details.split(DISCOUNT_SAVE) : discount_details.split(DISCOUNT_FOR)

  next if discount_details_parts.size != 2

  available_quantity = line_items.reduce(0) {|quantity, line_item| quantity + line_item.quantity}
  available_spend = line_items.reduce(Money.zero) {|total, line_item| total + line_item.line_price}

  discount_qualifier_type = discount_details_parts[0].include?('$') ? DISCOUNT_TYPE_SPEND : DISCOUNT_TYPE_QUANTITY
  discount_qualifier_value = discount_details_parts[0].sub('$', '').to_i
  discount_quantity = discount_qualifier_type == DISCOUNT_TYPE_SPEND ? available_quantity : [discount_qualifier_value, 1].max
  discount_spend = Money.new(cents: discount_qualifier_type == DISCOUNT_TYPE_SPEND ? discount_qualifier_value * 100 : 0)

  next if available_quantity < discount_quantity || available_spend < discount_spend

  discount_variant_id = discount.size > 1 && discount[1] == discount[1].to_i.to_s ? discount[1].to_i : nil
  discount_variant = !discount_variant_id.nil? ? Input.cart.line_items.find {|line_item| line_item.variant.id == discount_variant_id} : nil

  next if !discount_variant_id.nil? && discount_variant.nil?

  discount_type = discount_details_parts[1].include?('%') ? DISCOUNT_TYPE_PERCENT : DISCOUNT_TYPE_DOLLARS
  discount_value = discount_details_parts[1].sub('$', '').sub('%', '').to_f
  discount_multiplier = (available_quantity / discount_quantity).floor

  discount_message_position = discount_variant.nil? ? 1 : 2
  discount_message = discount.size > discount_message_position ? discount[discount_message_position] : nil

  if discount_message.nil?
    if discount_qualifier_type == DISCOUNT_TYPE_SPEND
      discount_message = "#{DISCOUNT_SPEND} $#{discount_spend.cents.to_s.to_f / 100} "
    elsif discount_quantity > 1
      discount_message = "#{DISCOUNT_BUY} #{discount_quantity} "
    else
      discount_message = ""
    end

    if discount_details.include?(DISCOUNT_SAVE)
      discount_message += "#{DISCOUNT_SAVE} "
    else
      discount_message += "#{DISCOUNT_FOR} "
    end

    if discount_type == DISCOUNT_TYPE_PERCENT
      discount_message += "#{discount_value}%"
    else
      discount_message += "$#{discount_value}"
    end
  end

  remaining_quantity_to_discount = discount_variant.nil? ? discount_quantity * discount_multiplier : discount_multiplier

  if discount_type == DISCOUNT_TYPE_PERCENT
    discount_percentage = (discount_details.include?(DISCOUNT_SAVE) ? 100 - discount_value : discount_value) / 100

    if !discount_variant.nil?
      line_item_quantity_to_discount = [remaining_quantity_to_discount, discount_variant.quantity].min
      discount_line_item_percentage(discount_variant, discount_percentage, line_item_quantity_to_discount, discount_message)
      break
    end

    line_items.each do |line_item|
      line_item_quantity_to_discount = [remaining_quantity_to_discount, line_item.quantity].min
      discount_line_item_percentage(line_item, discount_percentage, line_item_quantity_to_discount, discount_message)
      remaining_quantity_to_discount -= line_item_quantity_to_discount

      break if remaining_quantity_to_discount == 0
    end
  elsif discount_type == DISCOUNT_TYPE_DOLLARS
    discount_amount = Money.new(cents: discount_value * 100)
    remaining_amount_to_discount = discount_amount * discount_multiplier

    if !discount_variant.nil?
      line_item_quantity_to_discount = [remaining_quantity_to_discount, discount_variant.quantity].min
      if line_item_quantity_to_discount == remaining_quantity_to_discount
        line_item_amount_to_discount = remaining_amount_to_discount
      else
        line_item_amount_to_discount = discount_amount * (1 / discount_quantity) * discount_variant.quantity
      end
      if discount_details.include?(DISCOUNT_SAVE)
        discount_line_item_by_amount(discount_variant, line_item_amount_to_discount, discount_message)
      else
        discount_line_item_to_amount(discount_variant, line_item_amount_to_discount, line_item_quantity_to_discount, discount_message)
      end
      break
    end

    line_items.each do |line_item|
      line_item_quantity_to_discount = [remaining_quantity_to_discount, line_item.quantity].min
      if line_item_quantity_to_discount == remaining_quantity_to_discount
        line_item_amount_to_discount = remaining_amount_to_discount
      else
        line_item_amount_to_discount = discount_amount * (1 / discount_quantity) * line_item.quantity
      end
      if discount_details.include?(DISCOUNT_SAVE)
        discount_line_item_by_amount(line_item, line_item_amount_to_discount, discount_message)
      else
        discount_line_item_to_amount(line_item, line_item_amount_to_discount, line_item_quantity_to_discount, discount_message)
      end
      remaining_amount_to_discount -= line_item_amount_to_discount
      remaining_quantity_to_discount -= line_item_quantity_to_discount

      break if remaining_quantity_to_discount == 0
    end
  end
end

Input.cart.line_items.each do |line_item|
  next if !line_item.properties.key?('_gwp')
  discount_line_item_by_amount(line_item, line_item.line_price, "Free gift")
end

Output.cart = Input.cart
