class debugLogger {

    constructor(logSelector, filterSelector) {
        this.logDiv = document.querySelector(logSelector);
        this.filterDiv = document.querySelector(filterSelector);
        
        this.mode = 0;
        this.prevMode = this.mode;
        this.logData = [];
        this.filterTxt = "";

        this.logData = [];
        this.clear();
	}

    setMode(md) {
     //   alert("changing mode to " + md);
        if ( (md > 4) || (md < -1) ) {
          //  alert("Returning");
            return;
        }
        if (md === -1)
            return;
        this.prevMode = this.mode;
        this.mode = md;
    }

    restoreMode() {
        var m = this.mode;
        this.mode = this.prevMode;
        this.prevMode = m;
    }

    log(message) {
        this.logData.push(message);

        switch(this.mode) {
            case 0:
                break;
            case 1:
                console.log(this.filter(message));
                break;
            case 2:
                alert(filter(this.message));
                break;
            case 3:
                console.log(this.filter(message));
                alert(this.filter(message));
                break;
            case 4:
                this.logHTML(this.filter(message));
                break;
        }

    }

    logHTML(msg) {
        if (this.logDiv) {
            var newP = document.createElement("p");
            newP.classList = "debugdata";
            //debugSec.children('p')[0].innerHTML += message;
            if (this.mode != 0) {
                if (msg != "") {
                    newP.innerHTML = this.highlightErr(msg);
                    this.logDiv.appendChild(newP);
                }
            }
        }
    }

    highlightErr(msg) {
        if (msg.includes('$ERROR$')) {
            msg = msg.replace('$ERROR$', '<span style="color:red">$ERROR$</span>');
            //alert("Highlight red ERROR");
        } 
        return msg;
    }
    filter(msg) {
          if (this.filterDiv) {
            let filter = this.filterDiv.innerHTML;
            if (filter === "") {
                return msg;
            }

            if (!msg.includes(filter)) {
                msg = ""; //+= " does not include " + filter;
            }
        }
        return msg;
    }

    filterAll() {
      //  for (msg of logData)
    }

    clear() {
        this.logData = [];
        document.querySelectorAll(".debugdata").forEach(e => e.remove());
//        document.querySelectorAll('.classname').forEach(e => e.remove());
    }


    /*     
    https://stackoverflow.com/questions/11456850/split-a-string-by-commas-but-ignore-commas-within-double-quotes-using-javascript
           else {
            //    this.filterTxt = fu.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            //    this.filterTxt = fu.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)[4];
            //    alert("filter is " + this.filterTxt);    
            }
        }

    setAndApplyFilter() {
        var filter = this.filterBox.innerHTML;
        debugFilter = filter;
        this.clearDebug();
   //        var string = (this.debugDiv[0].innerHTML);
        var newStrArr = "";
        var oldStrArr = string.match(/\<p\b[\s\S]+?\<\/p\>/g);
        for (msg in oldStrArr) {
            if (msg.includes(filter))
                newStr.push(msg);
        }
    }



        */
}
