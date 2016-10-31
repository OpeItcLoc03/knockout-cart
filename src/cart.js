var Snolla = Snolla || {};
Snolla.CartItem = function(options, callback){
  
  var cartItem = {};
  var qty = (options.quantity || 1);
  cartItem.price = options.price || 0.00;
  cartItem.id = options.id || "";
  cartItem.quantity = ko.observable(qty).asPositiveInteger(1);
  cartItem.minQuantity = options.minQuantity || 1;
  cartItem.maxQuantity = options.maxQuantity || NaN;
  cartItem.image = options.image || "";
  cartItem.url = options.url || "";
  cartItem.title = options.title || "";
  cartItem.description = options.description || "";

  cartItem.priceInPennies = function(){
    return cartItem.price * 100;
  };

  cartItem.subtotal = ko.computed(function(){
    return cartItem.price * cartItem.quantity();
  });

  cartItem.discount = ko.computed(function(){
    return 0; //cartItem.quantity() >= 5 ? cartItem.subtotal() * 0.2 : 0;
  });

  cartItem.lineTotal = ko.computed(function() {
    return cartItem.subtotal() - cartItem.discount();
  });

  if(callback){
    cartItem.quantity.subscribe(function(quantity){
      callback.call(cartItem,cartItem); //? quantity
    });
  }

  return cartItem;
}

Snolla.Cart = function(){
  var self = this;
  var stored = JSON.parse(localStorage.getItem("SnollaCart")) || [];
  self.items = ko.observableArray();

  //remove an item if quantity is 0, passed to CartItem
  self.itemQuantityCheck = function(item) {
      if (item && item.quantity() === 0) {
          self.items.remove(item);
      }
  };

  //send the items that we load from storage through the CartItem constructor
  self.items(ko.utils.arrayMap(stored, function(item) {
     return Snolla.CartItem(item, self.itemQuantityCheck);
  }));


  self.addItem = function(item){
    var existing = self.find(item.id);
    var items = self.items();

    if(existing){
      existing.quantity(existing.quantity() + parseInt(item.quantity || 1, 10));
    }else{
      existing = Snolla.CartItem(item,self.itemQuantityCheck);
      self.items.push(existing); 
    }
    return existing;
  };
  

  self.rowCount = function() {
    return self.items().length;
  };

  self.remove = function(id) {
    self.items.remove(function(item) {
      return item.id == id;
    });
  };

  self.removeClicked = function(item) {
    self.remove(item.id);
  };

  self.itemCount = function() {
    var itemCount = 0;
    ko.utils.arrayForEach(self.items(),function(item){
      itemCount += item.quantity();
    });
    return itemCount;
  };

  self.total = function() {
    var sum = 0;
    ko.utils.arrayForEach(self.items(),function(item){
      sum += item.lineTotal();
    });
    return sum;
  };

  self.empty = function(){
    self.items([]);
  };

  self.find = function(id){
    return ko.utils.arrayFirst(self.items(),function(item){
      return item.id === id;
    });
  };

  //dirty tracking
  ko.computed(function(){
    localStorage.setItem("SnollaCart",ko.toJSON(self.items));
  }).extend({ rateLimit : 1 });

  self.hasItems = ko.computed(function(){
    return self.rowCount() > 0;
  });


  self.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  return self;


}