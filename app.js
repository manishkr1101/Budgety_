// jshint esversion:6
// BUDGET CONTROLLER
var budgetController = (function () {
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPerc = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round(this.value * 100 / totalIncome);
        }
        else{
            this.percentage = -1;
        }
    }

    Expense.prototype.getPerc = function(){
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [], // array of Expense objects
            inc: []  // array of Income objects
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        expPercentage: -1
    };

    return {
        addItems: function(type, des, val){
            let newItem,ID;
            // ID  = last id + 1
            // Create new Id
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }


            // Create new Item based on type of 'inc' or 'exp'
            if(type === 'exp'){

                newItem = new Expense(ID,des,val);
            }
            else if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }

            // pushing item to our data structure
            if(newItem){
                // we can use bracket optr instead of dot to access its
                data.allItems[type].push(newItem);
                // update totals of data
                data.totals[type] += val;
            }

            return newItem;
        },
        calculateBudget: function(){
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc){
                data.expPercentage = Math.round(data.totals.exp * 100 / data.totals.inc);
            }
            else{
                data.expPercentage = -1;
            }
            
        },
        calculatePercentages: function(){

            data.allItems.exp.forEach(function(exp){
                exp.calcPerc(data.totals.inc);
            });

        },
        getPercentages: function(){

            return data.allItems.exp.map(function(exp){
                return exp.getPerc();
            });
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                expPercentage: data.expPercentage
            };
        },
        deleteItem: function(type, id){
            // type: exp or inc
            

            // var ids = data.allItems[type].map(function(item){
            //     return item.id;
            // });
            // console.log(ids);

            // search for id and get its index
            let index, value;

            for(let i=0;i<data.allItems[type].length; i++){
                if(data.allItems[type][i].id === id){
                    index = i;
                    value = data.allItems[type][i].value;
                    break;
                }
            }

            // delete the index from array of type
            if(index >= 0){
                data.allItems[type].splice(index, 1);
            }

            // update totals
            data.totals[type] -= value;

        },
        testing: function(){
            //console.log(data);
            return data;
        }
    };

})();

// UI CONTROLLER
var UIController = (function () {

    let DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        expPercentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        monthLabel: '.budget__title--month'
    };

    function formatNumber(num, type){
        /**
         * 2345.6789 -> + 2,345.68
         */

         num = Math.abs(num);
         num = num.toFixed(2);

         let numSplit = num.split('.');

         let int = numSplit[0]; // 2345
         let dec = numSplit[1]; // 68

         if(int.length > 3){
             int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3 , 3); // 2,345
         }

        return (type==='inc'?'+':'-') + ' ' + int + '.' + dec;

    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: Number(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        /**
         * 
         * @param {object} obj object
         * @param {string} type type of object, will be exp or inc
         */
        addListItem: function(obj, type){
            var html,newHtml,element;

            // Create html text with placeholder
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%des%</div> <div class="right clearfix"> <div class="item__value">%val%</div>  <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            else if(type === 'exp'){
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%des%</div> <div class="right clearfix"> <div class="item__value">%val%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div></div></div>';
            }

            // replace placeholder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%des%',obj.description);
            newHtml = newHtml.replace('%val%', formatNumber(obj.value));

            

            // render it on page
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        clearFields: function(){
            // Get all fields to be cleared
            let fields = document.querySelectorAll(DOMStrings.inputDescription +', '+DOMStrings.inputValue);
            // convert it to array
            let fieldsArr = Array.prototype.slice.call(fields);

            // iterate action on each element
            fieldsArr.forEach(function(field, index){
                field.value = '';
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj){
            // obj = {budget, totalInc, totalExp, expPercentage}
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, obj.budget<0?'exp':'inc');
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.expPercentage > 0){
                document.querySelector(DOMStrings.expPercentageLabel).textContent = obj.expPercentage + '%';
            }
            else{
                document.querySelector(DOMStrings.expPercentageLabel).textContent = '---';
            }

        },
        displayPercentages: function(percentages){

            let fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            var forEachNode = function(lists, callback){
                for(let i=0;i<lists.length; i++){
                    callback(lists[i], i);
                }
            }

            forEachNode(fields, function(field, index){
                field.textContent = percentages[index] + '%';
            });
        },
        displayMonth: function(){
            const date = new Date();
            const month = date.toLocaleDateString('en-us', {month: 'long', year: 'numeric'});
            
            //display on ui
            document.querySelector(DOMStrings.monthLabel).textContent = month;
        },
        deleteListItem: function(itemId){
            var el = document.getElementById(itemId);
            el.parentNode.removeChild(el);
        },
        getDOMStrings: function(){
            return DOMStrings;
        }
    };



    /*
    const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August'];
    // INIT UI
    document.querySelector('.budget__title--month').innerText = month[(new Date).getMonth()]; // Update month

    $('.budget__value').text('+ 0.00'); // update budget value
    */


})();


// MAIN APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    function setupEventListener(){
        let DOM = UICtrl.getDOMStrings();
        // ADDING EVENT LISTENER TO THE ADD BUTTON
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) { // 13 is keycode for enter key. which is used for old browser
                ctrlAddItem();
            }
        });

        // add event listener to button to delete item
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }

    function updatePercentages(){
        //1. calculate percentages
        budgetCtrl.calculatePercentages();


        //2. read percentages from budget controller
        let percentages = budgetCtrl.getPercentages();

        //3. update percentages on the UI
        UICtrl.displayPercentages(percentages);

    }

    function updateBudget(){
        //1. Calculate budget
        budgetCtrl.calculateBudget();
        
        // 2. Return budget

        let budget = budgetCtrl.getBudget();

        // 3. Display the budget on UI
        UICtrl.displayBudget(budget);

        

    }

    var ctrlAddItem = function () {
        // 1.Reading input data
        let input = UICtrl.getInput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0){
            // 2.add the item to budget controller
            let newItem = budgetCtrl.addItems(input.type,input.description, input.value);

            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            UICtrl.clearFields();

            // 4.update budget
            updateBudget();

            //5. update percentages
            updatePercentages();
        }

        
        
    };

    function ctrlDeleteItem(event){
        var itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            var splitId = itemId.split('-');
            var type = splitId[0];
            var id = parseInt(splitId[1]);
            // delete from our data sturcture
            budgetCtrl.deleteItem(type, id);
            // delete from our UI
            UICtrl.deleteListItem(itemId);

            // recalculate the budget and update UI
            updateBudget();

            // update percentage
            updatePercentages();
        }
    }

    return {
        init: function(){
            console.log('Application has started');
            UICtrl.displayBudget(budgetCtrl.getBudget());
            UICtrl.displayMonth();
            setupEventListener();
            
        }
    };



})(budgetController, UIController);

controller.init();
