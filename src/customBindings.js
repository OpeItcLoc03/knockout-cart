//custom binding for currency formatting (wrapper to text binding)
ko.bindingHandlers.currency = {
    update: function(element, valueAccessor) {
        //unwrap the amount (could be observable or not)
        var amount = parseFloat(ko.utils.unwrapObservable(valueAccessor())) || 0;

        //could set the innerText/textContent directly or use $.text(), but we will just let the real text binding handle it by passing it our formatted text
        var newValueAccessor = function() {
            return amount.toFixed(2); // + " руб.";
        };

        //call real text binding
        ko.bindingHandlers.text.update(element,  newValueAccessor);       
    }        
};

//wrapper to click binding.  call handler with object from data- attributes
ko.bindingHandlers.clickWithData = {
    init: function(element, valueAccessor, allBindings, vm, context) {
        var data = $(element).data(),
            boundHandler = valueAccessor().bind(this, data); //this is context, data is first argument

        delete data.bind; //remove the data-bind attribute's data

        //call the real click binding
        ko.applyBindingsToNode(element, { click: boundHandler });
    }        
};

// Here's a custom Knockout binding that makes elements shown/hidden via jQuery's fadeIn()/fadeOut() methods
// Could be stored in a separate utility library
ko.bindingHandlers.fadeVisible = {
    init: function (element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function (element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
    }
};