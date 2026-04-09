# Ruby 4.0 removed String#tainted? and Object#tainted? (deprecated since 2.7).
# Liquid 4.x still calls it. This shim restores the method as a no-op so
# Jekyll can run under Ruby 4.0 without modification.
unless "".respond_to?(:tainted?)
  class Object
    def tainted?
      false
    end

    def taint
      self
    end

    def untaint
      self
    end
  end
end
