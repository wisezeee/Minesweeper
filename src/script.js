import './index.html'
import './style.css'
function isValid(row, col, height, width) {
    return row >= 0 && row < height && col >= 0 && col < width;
}

function getCount(row, col, isBomb) {
    let count = 0;
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            if (isBomb(row + y, col + x)) {
                count++;
            }
        }
    }
    return count;
}

function startGame(width, height, bombsCount) {
    const field = document.querySelector(".field");
    const cellsCount = width * height;
    field.innerHTML = "<button></button>".repeat(cellsCount);
    const cells = [...field.children];
    cells.forEach((cell) => {
        cell.className = "unclicked_btn";
    });

    let closedCount = cellsCount;
    const smiley = document.querySelector(".smiley");

    let gameStarted = false;

    const minLabelTen = document.querySelector("#min_ten");
    const minLabelOne = document.querySelector("#min_one");
    const secLabelTen = document.querySelector("#sec_ten");
    const secLabelOne = document.querySelector("#sec_one");
    let timer;

    function startLogoutTimer() {
        const startTime = new Date().getTime();

        const tick = function () {
            const newTime = new Date().getTime();
            const timePassed = Math.floor((newTime - startTime) / 1000);

            const remainingTime = time - timePassed;

            if (remainingTime <= 0) {
                clearInterval(timer);
                timesOut();
            }

            const min = Math.trunc(remainingTime / 60);
            const minTen = Math.trunc(min / 10);
            minLabelTen.className = `time_${minTen}`;
            const minOne = min % 10;
            minLabelOne.className = `time_${minOne}`;

            const sec = remainingTime % 60;
            const secTen = Math.trunc(sec / 10);
            secLabelTen.className = `time_${secTen}`;
            const secOne = sec % 10;
            secLabelOne.className = `time_${secOne}`;
        };
        let time = 2400;
        tick();
        return setInterval(tick, 1000);
    }

    timer = startLogoutTimer();

    const bombs = [...Array(cellsCount).keys()]
        .sort(() => Math.random() - 0.5)
        .slice(0, bombsCount);

    field.addEventListener("mousedown", (ev) => {
        if (ev.target.tagName !== "BUTTON") return;
        if (ev.button === 0) {
            smiley.className = "smiley_sc";
        }
    });

    //проверка нажатой кнопки
    field.addEventListener("mouseup", (ev) => {
        if (ev.target.tagName !== "BUTTON") return;

        if (ev.button === 0) {
            smiley.className = "smiley";
            const index = cells.indexOf(ev.target);
            const col = index % width;
            const row = Math.floor(index / width);
            open(row, col);
            gameStarted = true;
        }
    });

    field.addEventListener("contextmenu", (ev) => {
        console.log(ev.target);
        if (ev.target.tagName !== "BUTTON") return;
        if (ev.target.disabled) return;
        ev.preventDefault();

        if (
            ev.target.classList.contains("flag") &&
            !ev.target.classList.contains("unclicked_btn")
        ) {
            ev.target.classList.remove("flag");
            ev.target.className = "question_mark";
            return;
        }

        if (ev.target.classList.contains("question_mark")) {
            ev.target.classList.remove("question_mark");
            ev.target.className = "unclicked_btn";

            return;
        }

        ev.target.className = "flag";
    });

    smiley.addEventListener(
        "mousedown",
        (e) => (e.target.className = "smiley_clicked")
    );
    smiley.addEventListener("mouseup", (e) => (e.target.className = "smiley"));
    smiley.addEventListener("click", () => {
        clearInterval(timer);
        cells.forEach((cell) => {
            cell.classList.remove("flag");
            cell.classList.add("unclicked_btn");
        });
        smiley.replaceWith(smiley.cloneNode(true));
        field.replaceWith(field.cloneNode(true));
        startGame(width, height, bombsCount);
    });

    function open(row, col) {
        if (!isValid(row, col, height, width)) {
            return;
        }
        const index = row * width + col;
        const cell = cells[index];
        if (cell.disabled) {
            return;
        }
        cell.disabled = true;
        cell.className = "clicked_btn";
        if (isBomb(row, col) && gameStarted) {
            bombs.forEach((bomb) => {
                cells[bomb].className = "bomb";
                cells[bomb].disabled = true;
            });
            cells.forEach((cell) => {
                if (!isBomb(cell) && cell.classList.contains("flag")) {
                    cell.className = "wrong_bomb";
                }
            });
            cell.className = "bomb_exploded";
            cell.disabled = true;
            gameOver();
            clearInterval(timer);
            return;
        }
        closedCount--;
        if (closedCount <= bombsCount) {
            smiley.className = "smiley_cool";
            return;
        }

        const count = getCount(row, col, isBomb);
        if (count !== 0) {
            cell.className = "";
            cell.classList.add(`count_${count}`);
            return;
        }
        if (count === 0) {
            //открываем все соседние
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    open(row + y, col + x);
                }
            }
        }
    }

    function gameOver() {
        smiley.className = "smiley_dead";
        cells.forEach((cell) => (cell.disabled = true));
    }

    function timesOut() {
        cells.forEach((cell) => {
            const i = cells.indexOf(cell);
            const col = i % width;
            const row = Math.floor(i / width);
            open(row, col);
            bombs.forEach((bomb) => {
                cells[bomb].className = "bomb";
            });

            smiley.className = "smiley_dead";
        });
    }

    function isBomb(row, col) {
        if (!isValid(row, col, height, width)) return false;
        const index = row * width + col;
        return bombs.includes(index);
    }
}

startGame(16, 16, 40);