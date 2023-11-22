# Loyalty tag prefix applied to customers eg. `loyalty_tier:bronze`
LOYALTY_TIER_TAG_PREFIX = 'loyalty_tier:'

# Loyalty tiers with their matching free shipping thresholds in dollars
LOYALTY_TIER_FREE_SHIPPING_THRESHOLDS = {
  'bronze' => 50,
  'silver' => 0,
  'gold' => 0,
}

# Loyalty shipping methods that will be discounted to $0 when the above threshold is met
LOYALTY_TIER_FREE_SHIPPING_METHODS = [
  'Express Shipping'
]

# Loyalty discount message
LOYALTY_DISCOUNT_MESSAGE = 'Loyalty discount'

customer_loyalty_tier = nil
customer_spend = Input.cart.subtotal_price

if !Input.cart.customer.nil?
  customer_loyalty_tier_tag = Input.cart.customer.tags.detect {|tag| tag.start_with?(LOYALTY_TIER_TAG_PREFIX)}
  if customer_loyalty_tier_tag
    customer_loyalty_tier = customer_loyalty_tier_tag.sub(LOYALTY_TIER_TAG_PREFIX, '')
  end
end

customer_free_shipping_threshold = LOYALTY_TIER_FREE_SHIPPING_THRESHOLDS[customer_loyalty_tier]

if !customer_free_shipping_threshold.nil?
  Input.shipping_rates.each do |shipping_rate|
    next unless LOYALTY_TIER_FREE_SHIPPING_METHODS.include?(shipping_rate.name)
    next unless shipping_rate.price > Money.new(cents: 0)
    next unless customer_spend >= Money.new(cents: customer_free_shipping_threshold * 100)

    shipping_rate.apply_discount(shipping_rate.price, message: LOYALTY_DISCOUNT_MESSAGE)
  end
end

Output.shipping_rates = Input.shipping_rates
