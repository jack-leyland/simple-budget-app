var budgetController = (function () {
  var Expense = function (id, desc, val) {
    this.id = id;
    this.desc = desc;
    this.val = val;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.val / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, desc, val) {
    this.id = id;
    this.desc = desc;
    this.val = val;
  };

  var data = {
    allItems: {
      inc: [],
      exp: [],
    },
    totals: {
      inc: 0,
      exp: 0,
    },
    budget: 0,
    percentage: -1,
  };

  var calcTotal = function (type) {
    var sum = 0;

    data.allItems[type].forEach(function (curr) {
      sum += curr.val;
    });

    data.totals[type] = sum;
  };

  return {
    addItem: function (type, des, v) {
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

    deleteItem: function (type, id) {
      var ids, index;

      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calcBudget: function () {
      calcTotal('exp');
      calcTotal('inc');

      data.budget = data.totals.inc - data.totals.exp;

      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calcPercentages: function () {
      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (current) {
        return current.getPercentage();
      });
      return allPerc;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    printData: function () {
      console.log(data);
    },
  };
})();

var UIController = (function () {
  var DOMstrings = {
    inputType: '.add__type',
    inputDesc: '.add__description',
    inputVal: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incLabel: '.budget__income--value',
    expLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expPercentageLabels: '.item__percentage',
    dateLabel: '.budget__title--month',
    typeInput: '.add__type',
  };

  var formatNumber = function (num, type) {
    //the tutorial version of this function did not work for numbers with more than 6 digits so this
    //is the simplest way I could find to do it using what I currently know. Since nobody
    //in a different locale will be using this and the method is supported by most browsers
    //I'm going to leave it until I learn a better way to do it with regex, or actually write
    //the logic that iterates over a number and dynamically inserts the commas. This is just a
    //small Udemy course project that I am trying to get through so I know enough JS to start building
    //my own project :)

    var numSplit, dec, int;

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = parseInt(numSplit[0]).toLocaleString();
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        desc: document.querySelector(DOMstrings.inputDesc).value,
        val: parseFloat(document.querySelector(DOMstrings.inputVal).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;

      //create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix">\
                <div class="item__value">%val%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">\
                </i></button></div></div></div>';
      } else if (type === 'exp') {
        element = DOMstrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix">\
                <div class="item__value">%val%</div><div class="item__percentage">%percentage%</div><div class="item__delete">\
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //replace placeholder text with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%desc%', obj.desc);
      newHtml = newHtml.replace('%val%', formatNumber(obj.val, type));

      //add the HTML to DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    displayBudget: function (obj) {
      var type;
      obj.budget >= 0 ? (type = 'inc') : (type = 'exp');

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incLabel).textContent = formatNumber(
        obj.totalInc,
        'inc'
      );
      document.querySelector(DOMstrings.expLabel).textContent = formatNumber(
        obj.totalExp,
        'exp'
      );

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '- %';
      }
    },

    displayPercentages: function (percentages) {
      var fields = document.querySelectorAll(DOMstrings.expPercentageLabels);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '-%';
        }
      });
    },

    displayMonth: function () {
      var now, year, month, months;

      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();

      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + ' ' + year;
    },

    clearFields: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMstrings.inputDesc + ', ' + DOMstrings.inputVal
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current) {
        current.value = '';
      });

      fieldsArr[0].focus();
    },

    changeType: function () {
      var inputFields;
      inputFields = document.querySelectorAll(
        DOMstrings.inputType +
          ',' +
          DOMstrings.inputDesc +
          ',' +
          DOMstrings.inputVal
      );

      nodeListForEach(inputFields, function (cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    defaultInputSettings: function () {
      document.querySelector(DOMstrings.inputDesc).value = '';
      document.querySelector(DOMstrings.inputVal).value = '';
    },

    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();

var controller = (function (budgetCtrl, UICtrl) {
  var setupEventListeners = function () {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function (ev) {
      if (ev.keyCode === 13 || ev.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);

    document
      .querySelector(DOM.typeInput)
      .addEventListener('change', UICtrl.changeType);
  };

  var updateBudget = function () {
    budgetCtrl.calcBudget();
    var budget = budgetCtrl.getBudget();
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    budgetCtrl.calcPercentages();
    var percentages = budgetCtrl.getPercentages();
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function () {
    var input, newItem, data;
    input = UICtrl.getInput();
    if (input.desc !== '' && !isNaN(input.val) && input.val > 0) {
      newItem = budgetCtrl.addItem(input.type, input.desc, input.val);
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();
      updateBudget();
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (ev) {
    var itemID, splitID, type, ID;

    itemID = ev.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
      budgetCtrl.deleteItem(type, ID);
      UICtrl.deleteListItem(itemID);
      updateBudget();
      updatePercentages();
    }
  };

  return {
    init: function () {
      setupEventListeners();
      UICtrl.defaultInputSettings();
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0,
      });
    },
  };
})(budgetController, UIController);

controller.init();
