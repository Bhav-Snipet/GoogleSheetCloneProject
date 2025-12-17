//building head-row
const rows = 100; //A-to-D and a junction cell
const cols = 26; // 1 to 100 numbers
const headRow = document.querySelector(".head-row");
const headCol = document.querySelector(".serailNo");
const body = document.querySelector(".body");

//this code is to create first row i.e A-to-Z
for(let i=0 ; i<cols ; i++){
    const headcell = document.createElement("div");
    headcell.innerText = String.fromCharCode(i+65) //converts a number to string i.e. 0+65=65 => A
    headcell.classList.add("col-head");
    headRow.append(headcell);
}

//now we have to create 1st column i.e numbers 
for(let i=0 ; i<rows ; i++){
    const headColcell = document.createElement("div");
    headColcell.innerText = i+1;
    headColcell.classList.add("sno-cell");
    headCol.append(headColcell);
}

//now we will code body,as we want a kind of matrix,i.e. cells
for(let row=1 ; row<=rows ; row++){
    const rowcells = document.createElement("div");
    rowcells.classList.add("row");
    for(let col=1 ; col<=cols ; col++){
        const colCell = document.createElement("cite"); //we can use input instead of div but input elements are heavier then div's
        colCell.contentEditable = true; //now we can edit our div
        colCell.classList.add("cell");
        colCell.id = `${String.fromCharCode(64+col)}${row}`; //providing id to each cell A1,B1,C1,A2,B2,C2,etc
        rowcells.appendChild(colCell);
    }
    body.appendChild(rowcells);
}

/*
    heavier refers to performance cost
    associated with handling events,etc
    diff betweeen input n div
    puropse n functionality :- input is designed for user interaction allow user to enter data,div are generic html element used to structure HTML
    Performance consideration :- 
    1.rendering time :- input elements take more time compared to div elements bcoz of the user interaction n data taking functionality,comparatively div is faster
    2. Memory uses :- input elements consume more memory bcoz of same above nature,comparatively div elements take less memory
    3. event handling :- input elements comes with variety of events like focus,blur,change,etc which requires processing,but our div elements handles events only if js tell them to do so

    because of this in above example in our body i.e. cols inside each row we are going with div elements instead of input elements

    but how we can achieve input functionality in div?
    there is a attribute in div element contenteditable it is bydefault set to false i.e. no one can edit div but if u set it to true u can edit it
    but there is problem with this whenever u press enter one more div gets created
    so to deal with this div problem,instead of div use a span element,so whenever u press enter now <br> is created automatically
    n we want this functionality in our each cell

    but we can again go with div if you use the property of overflow:hidden and display:inline-block

    we can use cite tag which will give same functionality
    if we press enter <br> will be created so we will apply site tag to each cell
*/