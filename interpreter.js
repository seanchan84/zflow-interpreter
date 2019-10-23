function interpreter(str, data, v=null) {
    function isArrayStatment(v) { return (v.search(/[\[|.]/)>=0) }
    let tmp = str.replace(/\{\{\s*([^\{^\}]+)\s*\}\}/g, function (m, p1) {
        var val = "", vs = p1.trim().split(" | ");
        // example data = {{val[0].name | ucfirst | cut:120}}
        // then valStatment = val[0].name
        //      valHandle = [uncfirst,cut:120]
        let valStatment = vs[0].trim();

        //check valStatment is a function or not
        let isFun = /.+\(.*\)/.test(valStatment);
        if (isFun) {
            let funName = "";
            let funParams = "";
            valStatment.replace(/(.+)\((.*)\)/, function(m,n,p) {
                funName = n;
                funParams = p.split(/\s*,\s*/);
            });
            switch (funName) {
                case 'uid':
                    valStatment = (funParams.length > 0) ? uid(parseInt(funParams[0])) : uid();
                    break;
                default:
                    break;
            }
        }
        
        //check valStatment is an array or not; find . and []
        if (!isArrayStatment(valStatment)) {
            if (valStatment == "val") {
                val = (v!=null) ? v : "";
            } else {
                val = (data.hasOwnProperty(valStatment)) ? data[valStatment] : valStatment;
            }
        } else {
            //get the head by split the first . or [;
            let found = valStatment.search(/[\[|.]/);
            //let head = (found>=0) ? valStatment.substring(0, found) : valStatment;
            let head = valStatment.substring(0, found);

            if (head == "val") {
                head = v;
            } else {
                head = (data.hasOwnProperty(head)) ? data[head] : null;
            }

            if (isObject(head)) head = JSON.stringify(head);
            if (isJson(head)) {
                var result = "error";
                try {
                    result = eval(head + valStatment.substring(found));
                } catch (err) {
                    console.log(err);
                }
                val = result;
            }
        }

        if (vs.length<=1) return val;

        //handle Data
        for (let i=1;i<vs.length;i++) {
            let handleData = vs[i].trim().split(":");
            let handleName = handleData[0];
            switch (handleName) {
                case 'ucfirst':
                    if (typeof val == "string") {
                        if (val.length > 0) val = val.charAt(0).toUpperCase() + val.slice(1);
                    }
                    break;
                case 'lcfirst':
                    if (typeof val == "string") {
                        if (val.length > 0) val = val.charAt(0).toLowerCase() + val.slice(1);
                    }
                    break;
                case 'cut':
                    if (typeof val == "string") {
                        let cutLen = (handleData.length>1) ? handleData[1] : 100;
                        val = val.substr(0,cutLen);
                    }
                    break;
                case 'plainText':
                    let div = newdom("div").html(val);
                    val = div.textContent || div.innerText || val;
                    break;
                default:
                    break;
            }
        }
        return val;
    });
    return tmp;
}
