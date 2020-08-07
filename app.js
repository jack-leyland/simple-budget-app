var budgetController = (function() {

    var Expense = function(id, desc, val) {
        this.id = id;
        this.desc = desc;
        this.val = val;
    }

    var Income = function(id, desc, val) {
        this.id = id;
        this.desc = desc;
        this.val = val;
    }

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }

    var calcTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(curr) {
            sum += curr.val;
        });

        data.totals[type] = sum;
    }

    return {
        addItem: function(type, des, v) {
            var newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            if (type === 'exp') {
                newItem = new Expense(ID, des, v);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, v);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            };            

        },

        calcBudget: function() {

            calcTotal('exp');
            calcTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        printData: function() {
            console.log(data);
        }
    }

})();

var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputVal:'.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incLabel: '.budget__income--value',
        expLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }


    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                desc: document.querySelector(DOMstrings.inputDesc).value,
                val: parseFloat(document.querySelector(DOMstrings.inputVal).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            //create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix">\
                <div class="item__value">%val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">\
                </i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix">\
                <div class="item__value">%val%</div><div class="item__percentage">%percentage%</div><div class="item__delete">\
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%desc%', obj.desc);
            newHtml = newHtml.replace('%val%', obj.val);

            //add the HTML to DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el);
        },

        displayBudget: function(obj) {
            
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incLabel).textContent = '+ ' + obj.totalInc;
            document.querySelector(DOMstrings.expLabel).textContent = '- ' + obj.totalExp;

            if (obj.percentage > 0 ) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + ' %';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '- %';
            }
            
        },

        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputVal);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current){
                current.value = "";
            });

            fieldsArr[0].focus();

        },

        getDOMstrings: function() {
            return DOMstrings;
        },
    }

})();

var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(ev){
    
            if (ev.keyCode === 13 || ev.which === 13) {
                ctrlAddItem();
            }
    
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function() {
        //calc budget
        budgetCtrl.calcBudget();

        //return budget
        var budget = budgetCtrl.getBudget();
        
        //display budget
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function() {
        var input, newItem, data;

        // get field input data, add item to budget back end, display item on UI, calculate and update budget

        input = UICtrl.getInput();

        if (input.desc !== "" && !isNaN(input.val) && input.val > 0 ) {

            newItem = budgetCtrl.addItem(input.type, input.desc, input.val);

            UICtrl.addListItem(newItem, input.type);
    
            UICtrl.clearFields();
    
            updateBudget();

        };
    };

    var ctrlDeleteItem = function(ev) {
        var itemID, splitID, type, ID; 

        itemID = ev.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();
        };
    };

    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
        }
    };

})(budgetController, UIController);

controller.init();