//this body is variable which is available script.js so we are accessing it directly,how accessing direclty,bcoz in html we added options.js after script.js
//so all the variables which are declared in script.js will be accessible in options.js

let selectedCell = "";
const activeCellElement = document.querySelector(".selected-cell");
const form = document.querySelector(".form-container");
const expressionInput = document.querySelector(".expression");
const state = {};

//this is going to be default state of every cell
const defaultState = {
    innerText: "",
    isBold: false,
    isItalic: false,
    isUnderlined: false,
    align: left,
    fontSize: "16",
    fontFamily: "default",
    textColor: "#000000",
    backgroundColor: "#ffffff"
};

//here we are using the concept of event delegation n applying eventlistner to only body i.e. all cells instead of each cell
body.addEventListener("click",(event) => {
    form.reset();
    if(selectedCell){ //if cell is already selected we have to remove it
        selectedCell.classList.remove("active-cell");    
    }
    selectedCell = event.target;
    console.log(event.target); //which cell has been clicked that will display
    activeCellElement.innerText = selectedCell.id;
    selectedCell.classList.add("active-cell");
    if(!state[selectedCell.id]){
        state[selectedCell.id] = {
            ...defaultState, innerText: selectedCell?.innerText,
        };     
    }
    state[selectedCell.id] = {
        ...state[selectedCell.id], innerText: selectedCell?.innerText,
    };
    applyCellInfoToForm();
});

body.addEventListener("input",(event) => {
    selectedCell = event.target;
    if(!state[selectedCell.id]){
        state[selectedCell.id] = {
            ...defaultState, innerText: selectedCell?.innerText,
        };     
        return;
    }
    state[selectedCell.id] = {
        ...state[selectedCell.id], innerText: selectedCell?.innerText,
    };
    applyCellInfoToForm();
});

//we added actionListener on form so if anything clicked will be seen i.e. bold,italic,alignment,etc,bocz they are inside form
form.addEventListener('change',() => { 
    console.log("change event triggered");
    if(!selectedCell){
        alert("please select a cell before making change on options");
        form.reset(); //if any cell is not selected so the options willnot be clicked
        return;
    }
    // Extracting form data dynamically
    const formdata = Array.from(new FormData(form)).reduce((acc, [key, value]) => {
        acc[key] = form[key].type === "checkbox" ? form[key].checked : value;
        return acc;
    }, {});

    //update the state of selected cell
    state[selectedCell.id] = {
        ...formdata,innerText:selectedCell.innerText,
    };

    //console.log(formdata); //once you have the form data with you,you should change the text written in cell to this form option properties
    applyStyleToSelectedCell(formdata);
});

function applyStyleToSelectedCell(styles) {
    Object.entries(styles).forEach(([key, value]) => {
        switch (key) {
            case "fontSize":
                selectedCell.style.fontSize = value + "px";
                break;
            case "fontFamily":
                selectedCell.style.fontFamily = value;
                break;
            case "isBold":
                selectedCell.style.fontWeight = value ? "bold" : "normal";
                break;
            case "isItalic":
                selectedCell.style.fontStyle = value ? "italic" : "normal";
                break;
            case "isUnderlined":
                selectedCell.style.textDecoration = value ? "underline" : "none";
                break;
            case "align":
                selectedCell.style.textAlign = value; // left, center, right
                break;
            case "textColor":
                selectedCell.style.color = value;
                break;
            case "backgroundColor":
                selectedCell.style.backgroundColor = value;
                break;
            default:
                console.warn(`Unhandled style property: ${key}`);
        }
    });
}


//whatever expression we are getting in exp box we are evaluating her
expressionInput.addEventListener("keyup",(event) => {
    //console.log(event);
    if(event.key === "Enter"){
        const expressionResult = eval(event?.target?.value);
        console.log(expressionResult);
        selectedCell.innerText = expressionResult;
    }
});

function applyCellInfoToForm(){
    //putting cell to the state object 1st time with default state
    if(!state[selectedCell.id]){
        console.log(defaultState);
        return;
    }
    //if cell is already present in the state object then print its current state
    console.log(state[selectedCell.id]);
    synFormOptions(state[selectedCell.id]); //seeing properites of each cell
}

//this function is implemeted when we will go to paticular cell we should see their properties i.e. bold,italic,align,backgrouncolor,etc
function synFormOptions(selectedCellState){
    for(let key in selectedCellState){
        if(key=="isBold" || key=="isItalic" || key=="isUnderlined"){
            form[key].checked = selectedCellState[key];
        }else{
            form[key].value = selectedCellState[key];
        }
    }
}

//ctrl + k + c to comment the code
//ctrl + k + u to uncomment the code