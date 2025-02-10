let numRows;
let numCols;
let numItems;
let currCell;
let bufferColor;
let nameList;
let gameType;
let clickCount;
let correctCount;

function maketable(itemsPerRow, imgTitle, urlTitle) {
    numRows = Math.ceil(imgTitle.length / itemsPerRow);
    numCols = itemsPerRow;
    const gameBoard = document.querySelector('table.gameboard');
    
    for (let i = 0; i < numRows; i++) {
        const row = document.createElement('tr');
        row.className = 'gameboard';
        gameBoard.appendChild(row);
    }
    
    const rows = document.querySelectorAll('tr.gameboard');
    rows.forEach(row => {
        for (let i = 0; i < numCols; i++) {
            const td = document.createElement('td');
            td.className = 'gameboard';
            td.innerHTML = '<span class="name"></span><br/><img style="display:none;" />';
            row.appendChild(td);
        }
    });
}

function reset_game(imgTitle, urlTitle) {
    document.querySelector('span.winner').style.display = 'none';
    document.querySelector('span.refresh').style.display = 'none';
    document.querySelector('progress.progress-bar').value = 0;

    clickCount = correctCount = 0;
    
    // parse game type
    try {
        gameType = window.location.href.split('?')[1].split('&')[0];
    }
    catch (err) {
        gameType = 'faces';
    }

    // shuffle and deal names
    nameList = [];
    for (let i = 1; i < imgTitle.length; i++) {
        nameList.push([imgTitle[i], urlTitle[i]]);
    }
    numItems = nameList.length;
    nameList = shuffle(nameList);
    deal_images();
    nameList = shuffle(nameList);
    randname();

    document.querySelector('span.queryline').style.display = 'block';
}

// Randomize the names and faces and deal them into the table
function deal_images() {
    const spans = document.querySelectorAll("span.name");
    const imgs = document.querySelectorAll("img");
    
    for(let i = 0; i < numItems; i++) {
        spans[i].textContent = nameList[i][0];
        spans[i].setAttribute("tag", nameList[i][0]);
        spans[i].parentElement.setAttribute("tag", nameList[i][0]);
        spans[i].parentElement.setAttribute("guessed", "false");
        
        imgs[i].src = nameList[i][1];
        imgs[i].setAttribute("tag", nameList[i][0]);
        
        if (gameType == "faces") {
            imgs[i].style.display = "none";
            spans[i].style.display = "inline";
        }
        else {
            imgs[i].style.display = "inline";
            spans[i].style.display = "none";
        }
    }   
    
    for (let i = numItems; i < numRows * numCols; i++) {
        spans[i].parentElement.style.backgroundColor = '#d3d3d3';
    }
}

function keypress(event) {
    const cells = document.querySelectorAll('td.gameboard');
    let td = cells[currCell || 0];
    
    if (currCell == null) {
        currCell = 0;
    }
    else {
        td.style.backgroundColor = bufferColor;
        const currRow = Math.floor(currCell / numCols);
        const currCol = currCell % numCols;

        const key = event.which;
        if (key == 37) { // left
            currCell = currCell - 1;
            if (Math.floor(currCell / numCols) < currRow)
                currCell = currCell + 1;
        } else if (key == 38) { // up
            currCell = currCell - numCols;
            if (currCell < 0)
                currCell = currCell + numCols;
        } else if (key == 39) { // right
            currCell = currCell + 1;
            if (Math.floor(currCell / numCols) > currRow || currCell >= numItems)
                currCell = currCell - 1;
        } else if (key == 40) { // down
            currCell = currCell + numCols;
            if (currCell >= numItems)
                currCell = currCell - numCols;
        } else if (key == 13) { // return key
            td.style.backgroundColor = "#BCED91";
            check_answer(td.getAttribute("tag"));
            bufferColor = td.style.backgroundColor;
            return;
        } else {
            return;
        }
    }
    td = cells[currCell];
    bufferColor = td.style.backgroundColor;
    td.style.backgroundColor = "#BCED91";
}

function check_answer(tag) {
    if (!timerRunning) {
        InitializeTimer();
    }
    ++clickCount;
    document.querySelector('span.counter').textContent = clickCount;
    
    let choice;
    if (gameType == "faces") {
        choice = document.querySelector(`img[tag="${tag}"]`);
    } else {
        choice = document.querySelector(`span.name[tag="${tag}"]`);
    }
    
    fadeIn(choice);
    
    const query = document.querySelector('div.query');
    if (query.getAttribute('tag') == choice.getAttribute('tag')) {
        // You guessed correctly
        choice.style.color = "#000000";
        choice.parentElement.style.backgroundColor = '#F0F0D0';
        choice.parentElement.setAttribute('guessed', 'true');
        
        // Progress Bar
        updateProgress(numItems);
        
        // Correct Counter
        correctCount = ++correctCount || 1;
        document.querySelector('span.correct').textContent = `${correctCount}/${numItems}`;
        
        if (document.querySelectorAll('td[guessed="false"]').length == 0) {
            // You win!
            StopTheClock();
            document.querySelector('span.queryline').style.display = 'none';
            fadeIn(document.querySelector('span.winner'));
            setTimeout(() => {
                fadeIn(document.querySelector('span.refresh'));
            }, 2000);
        } else {
            // You still have more names to guess
            randname();
        }
        return true;
    } else {
        // You guessed incorrectly
        choice.parentElement.style.backgroundColor = '#FFFFFF';
        choice.style.color = "#FF0000";
        fadeOut(choice);
        return false;
    }
}

function updateProgress(imgLength) {
    const progressBar = document.querySelector('progress.progress-bar');
    const currentValue = progressBar.value;
    if (currentValue < 100) {
        progressBar.value = currentValue + (100/imgLength);
    }
}

function randname() {
    const newname = nameList.shift();
    if (newname !== undefined) {
        const q = document.querySelector('div.query');
        q.setAttribute("tag", newname[0]);
        
        if (gameType == "faces") {
            q.innerHTML = `<img src="${newname[1]}" />`;
        } else {
            q.textContent = newname[0];
        }
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Animation utilities
function fadeIn(element) {
    element.style.opacity = 0;
    element.style.display = '';
    
    let opacity = 0;
    const timer = setInterval(() => {
        opacity += 0.1;
        element.style.opacity = opacity;
        
        if (opacity >= 1) {
            clearInterval(timer);
        }
    }, 50);
}

function fadeOut(element) {
    let opacity = 1;
    const timer = setInterval(() => {
        opacity -= 0.1;
        element.style.opacity = opacity;
        
        if (opacity <= 0) {
            element.style.display = 'none';
            clearInterval(timer);
        }
    }, 50);
}

// Timer functions
let secs;
let timerID = null;
let timerRunning = false;

function InitializeTimer() {
    secs = 0;
    StopTheClock();
    StartTheTimer();
}

function StopTheClock() {
    if (timerRunning) {
        clearTimeout(timerID);
    }
    timerRunning = false;
}

function StartTheTimer() {
    document.querySelector('span.timer').textContent = secs;
    secs = secs + 1;
    timerRunning = true;
    timerID = setTimeout(StartTheTimer, 1000);
}
