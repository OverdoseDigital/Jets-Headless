# ================================ Customizable Settings ================================
# ================================================================
# Hide Gateway(s) for Product
#
# If the cart contains any matching items, the entered gateway(s)
# are hidden.
#
#   - 'product_selector_match_type' determines whether we look for
#     products that do or don't match the entered selectors. Can
#     be:
#       - ':include' to check if the product does match
#       - ':exclude' to make sure the product doesn't match
#   - 'product_selector_type' determines how eligible products
#     will be identified. Can be either:
#       - ':tag' to find products by tag
#       - ':type' to find products by type
#       - ':vendor' to find products by vendor
#       - ':product_id' to find products by ID
#       - ':variant_id' to find products by variant ID
#       - ':subscription' to find subscription products
#   - 'product_selectors' is a list of strings or numbers to
#     identify products by the above selector type
#   - 'gateway_match_type' determines whether the below strings
#     should be an exact or partial match. Can be:
#       - ':exact' for an exact match
#       - ':partial' for a partial match
#   - 'gateway_names' is a list of strings to identify gateways
# ================================================================
HIDE_GATEWAY_FOR_PRODUCT = [
  {
    product_selector_match_type: :include,
    product_selector_type: :product_id,
    product_selectors: [7752116011260],
    gateway_match_type: :exact,
    gateway_names: ["Afterpay", "Zip - Buy now, pay later"],
  },
]

# ================================ Script Code (do not edit) ================================
# ================================================================
# ProductSelector
#
# Finds matching products by the entered criteria.
# ================================================================
class ProductSelector
  def initialize(match_type, selector_type, selectors)
    @match_type = match_type
    @comparator = match_type == :include ? 'any?' : 'none?'
    @selector_type = selector_type
    @selectors = selectors
  end

  def match?(line_item)
    if self.respond_to?(@selector_type)
      self.send(@selector_type, line_item)
    else
      raise RuntimeError.new('Invalid product selector type')
    end
  end

  def tag(line_item)
    product_tags = line_item.variant.product.tags.map { |tag| tag.downcase.strip }
    @selectors = @selectors.map { |selector| selector.downcase.strip }
    (@selectors & product_tags).send(@comparator)
  end

  def type(line_item)
    @selectors = @selectors.map { |selector| selector.downcase.strip }
    (@match_type == :include) == @selectors.include?(line_item.variant.product.product_type.downcase.strip)
  end

  def vendor(line_item)
    @selectors = @selectors.map { |selector| selector.downcase.strip }
    (@match_type == :include) == @selectors.include?(line_item.variant.product.vendor.downcase.strip)
  end

  def product_id(line_item)
    (@match_type == :include) == @selectors.include?(line_item.variant.product.id)
  end

  def variant_id(line_item)
    (@match_type == :include) == @selectors.include?(line_item.variant.id)
  end

  def subscription(line_item)
    !line_item.selling_plan_id.nil?
  end
end

# ================================================================
# GatewayNameSelector
#
# Finds whether the supplied gateway name matches any of the
# entered names.
# ================================================================
class GatewayNameSelector
  def initialize(match_type, gateway_names)
    @comparator = match_type == :exact ? '==' : 'include?'
    @gateway_names = gateway_names.map { |name| name.downcase.strip }
  end

  def match?(payment_gateway)
    @gateway_names.any? { |name| payment_gateway.name.downcase.strip.send(@comparator, name) }
  end
end

# ================================================================
# HideGatewayForProductCampaign
#
# If the cart contains any matching items, the entered gateway(s)
# are hidden.
# ================================================================
class HideGatewayForProductCampaign
  def initialize(campaigns)
    @campaigns = campaigns
  end

  def run(cart, payment_gateways)
    @campaigns.each do |campaign|
      product_selector = ProductSelector.new(
        campaign[:product_selector_match_type],
        campaign[:product_selector_type],
        campaign[:product_selectors],
      )

      next unless cart.line_items.any? { |line_item| product_selector.match?(line_item) }

      gateway_name_selector = GatewayNameSelector.new(
        campaign[:gateway_match_type],
        campaign[:gateway_names],
      )

      payment_gateways.delete_if do |payment_gateway|
        gateway_name_selector.match?(payment_gateway)
      end
    end
  end
end

CAMPAIGNS = [
  HideGatewayForProductCampaign.new(HIDE_GATEWAY_FOR_PRODUCT),
]

CAMPAIGNS.each do |campaign|
  campaign.run(Input.cart, Input.payment_gateways)
end

Output.payment_gateways = Input.payment_gateways
