function test_debug_constructor() {
    logSelector = '#debug';
    filterSelector = '#debugFilter';

    let debugg = new debugLogger(logSelector, filterSelector);
    if (debugg.mode != 0)
        alert("Mode incorrect");
    
    let logDiv = document.querySelector(logSelector);
    let filterDiv = document.querySelector(filterSelector);

    if (logDiv != debugg.logDiv)
        alert("bad logDiv");

    if (filterDiv != debugg.filterDiv)
        alert("bad filterDiv")
}

function test_setMode() {
    logSelector = '#debug';
    filterSelector = '#debugFilter';

    let debugg = new debugLogger(logSelector, filterSelector);

    debugg.setMode(0);
    if (debugg.prevMode != 0) {
        alert("Failed setMode");
    }
    debugg.setMode(1);
    debugg.setMode(2);
    if (debugg.mode != 2)
        alert("failed set: expected mode = 2, got " + debugg.mode);
    if (debugg.prevMode != 1)
        alert("failed set: expected prevMode = 1, got " + debugg.prevMode);
    debugg.restoreMode();
    if (debugg .prevMode != 2)
        alert("failed restore: expected prevMode = 2, got " + debugg.prevMode);
    if (debugg.mode != 1)
        alert("failed restore: expected 1, got " + debugg .mode);
    debugg.setMode(6);
    if (debugg.mode != 1)
        alert("failed out of bounds mode: expected 1, got " + debugg .mode);
    debugg.setMode(-1)
        if (debugg.mode != 1)
        alert("failed keep mode when -1: expected 1, got " + debugg .mode);

}

function test_log_nofilter() {
    logSelector = '#debug';
    filterSelector = '#debugFilter';

    let debugg = new debugLogger(logSelector, filterSelector);

    debugg.setMode(0);
    debugg.log("Testing log write");

    debugg.setMode(4);
    debugg.log("Mode 4");
}

function test_filter() {
    logSelector = '#debug';
    filterSelector = '#debugFilter';

    let debugg = new debugLogger(logSelector, filterSelector);

    debugg.setMode(4);
    debugg.clear();
    debugg.log("Testing Goodbye");
    debugg.log("Testing Hello");
    logs = document.querySelectorAll(".debugdata");

    if (logs.length != 2) {
        alert("log error: expected 2 lines: got " + logs.length)
    }
    if ( (logs[0].innerHTML != "Testing Goodbye") || (logs[1].innerHTML != "Testing Hello") ) {
        alert ("failed log with no filter");
    }

    document.querySelector(filterSelector).innerHTML = "Hello";
    debugg.log("Testing Goodbye");
    debugg.log("Testing Hello");
    logs = document.querySelectorAll(".debugdata");
    if (logs.length != 3) {
        alert("log error: expected 3 lines: got " + logs.length)
    }
    if ( (logs[2].innerHTML != "Testing Hello") ) {
        alert ("failed log with Hello filter");
    }

    document.querySelector(filterSelector).innerHTML = "Goodbye";
    debugg.log("Testing Goodbye");
    debugg.log("Testing Hello");
    logs = document.querySelectorAll(".debugdata");
    if (logs.length != 4) {
        alert("log error: expected 4 lines: got " + logs.length)
    }
    if ( (logs[3].innerHTML != "Testing Goodbye") ) {
        alert ("failed log with Goodbye filter");
    }

    debugg.clear();
    logs = document.querySelectorAll(".debugdata");
    if (logs.length > 0) {
        alert("Error clearing log");
    }

    document.querySelector(filterSelector).innerHTML = "Testing";
    debugg.log("$ERROR$ Testing Hello");
    debugg.log("Testing Goodbye");
    logs = document.querySelectorAll(".debugdata");
   if (logs.length != 2) {
        alert("log error: expected 2 lines: got " + logs.length)
    }
    if ( (logs[1].innerHTML != "Testing Goodbye") ) {
        alert ("failed log with Goodbye filter");
    }

}