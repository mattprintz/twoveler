// Javascript for edit page

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function charWidth() {
    var span = document.createElement("span");
    span.textContent = "m";
    span.style.visibility = "hidden";
    
    document.body.appendChild(span);
    var width = span.offsetWidth;
    document.body.removeChild(span);
    
    return width;
}

function setWidths() {
    var tweetLength = (charWidth() * 140) + "px";
    for(var i = 0; i < document.styleSheets.length; i ++) {
        if(/edit\.css/.test(document.styleSheets[i].href)) {
            var stylesheet = document.styleSheets[i];
            var rules = stylesheet.cssRules;
            for(var j = 0; j < rules.length; j++) {
                if(/140e[xm]/.test(rules[j].cssText)) {
                    var newRule = rules[j].cssText.replace(/140ex/g, tweetLength);
                    stylesheet.deleteRule(j);
                    stylesheet.insertRule(newRule, j);
                }
            }
        }
    }
}

function onLoad(event) {
   var tweetDiv = document.getElementById("tweets");
   
   tweetDiv.scrollTop = tweetDiv.scrollHeight;
   
   setWidths();
}

function submitInlineEdit(event) {
    var inputBox = document.getElementById("inlineeditbox"),
        input = document.getElementById("inlineeditinput");
    
    var tweetId = inputBox.getAttribute("tweetId");
    
    var tweet = document.getElementById(tweetId),
        tweetText = tweet.getElementsByClassName("tweet_text")[0],
        tweetNum = tweetId.replace(/^tweet/, "");
    
    var newValue = input.value,
        origValue = tweet.getAttribute("originalText");
    
    
    if (event.type == "keypress") {
        if (event.keyCode == 27) {
            input.value = origValue;
            input.blur();
            return;
        }
        else if (event.keyCode != 13) {
            return;
        }
        else {
            input.blur();
            return;
        }
    }
    if(event.target != input) {
        return;
    }
    
    if(newValue != origValue) {
        
        var req = new XMLHttpRequest();
        req.open("POST", "/edit/inline/");
        
        var datastring = encodeURIComponent("id") + "=" + encodeURIComponent(tweetNum) + "&" +
                         encodeURIComponent("newcontent") + "=" + encodeURIComponent(input.value);
        
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.setRequestHeader("Content-length", datastring.length);
        req.setRequestHeader("Connection", "close");
        req.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
        
        req.onload = function(evt) {
            var result = JSON.parse(req.responseText);
            if(result == true) {
                tweetText.textContent = input.value;
                tweet.setAttribute("originalText", input.value);
            }
            
            inputBox.hidden = true;
            tweet.hidden = false;
            input.value = "";
            inputBox.removeAttribute("tweetId");
        }
        
        req.onerror = function(evt) {
            inputBox.hidden = true;
            tweet.hidden = false;
            input.value = "";
            inputBox.removeAttribute("tweetId");
        }
        
        req.send(datastring);
        
    }
    else {
        inputBox.hidden = true;
        tweet.hidden = false;
        input.value = "";
        inputBox.removeAttribute("tweetId");
    }
    
}

function editTweet(elem) {
    var inputBox = document.getElementById("inlineeditbox"),
        input = document.getElementById("inlineeditinput");
    elem.parentNode.insertBefore(inputBox, elem);
    elem.hidden = true;
    inputBox.hidden = false;
    
    var tweetId = elem.getAttribute("id");
    inputBox.setAttribute("tweetId", tweetId);
    
    input.value = elem.getAttribute("originalText");
    
    input.focus();
    input.select();
    input.addEventListener("blur", submitInlineEdit, false);
    input.addEventListener("keypress", submitInlineEdit, false);
}

function hoverPopup(evt, elem) {
    var popup = document.getElementById("tweetpopup");
    elem.appendChild(popup);
    popup.style.height = elem.clientHeight;
    popup.style.right = document.body.clientWidth - (elem.offsetLeft + elem.offsetWidth);
    popup.style.display = "inline";
    popup.setAttribute("tweetId", elem.id);
}

function cleanPopup(evt, elem) {
    
    var popup = document.getElementById("tweetpopup");
    var related = evt.relatedTarget;
    if(!related) {
        return;
    }
    var relationship = related.compareDocumentPosition(elem) & elem.DOCUMENT_POSITION_CONTAINS;
    if (relationship == 8 || related == elem) {
        return;
    }
    popup.style.display = "none";
    popup.removeAttribute("tweetId");
    document.body.appendChild(popup);
}

function deleteTweet(evt, elem) {
    var popup = document.getElementById("tweetpopup");
    var tweetId = popup.getAttribute("tweetId"),
        tweet = document.getElementById(tweetId),
        tweetText = tweet.getElementsByClassName("tweet_text")[0].textContent,
        tweetNum = tweetId.replace(/^tweet/, "");
    if(!window.confirm("Are you sure you want to delete this tweet?\n\n" +
                      tweetText.substr(0,40) + (tweetText.length > 40 ? "..." : ""))) {
        return;
    }
    
    var req = new XMLHttpRequest();
    req.open("POST", "/edit/delete/");
    
    var datastring = encodeURIComponent("id") + "=" + encodeURIComponent(tweetNum) + "&" +
                     encodeURIComponent("textvalue") + "=" + encodeURIComponent(tweetText);
    
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.setRequestHeader("Content-length", datastring.length);
    req.setRequestHeader("Connection", "close");
    req.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    
    req.onload = function(evt) {
        var result = JSON.parse(req.responseText);
        if(result == true) {
            document.location.reload();
        }
        else {
            //TODO: Add error catching here
        }
        
    }
    
    
    req.onerror = function(evt) {
        //TODO: Add error catching here
    }
    
    req.send(datastring);
    
}

function insertTweet(evt, elem) {
    var popup = document.getElementById("tweetpopup");
    var tweetId = popup.getAttribute("tweetId"),
        tweet = document.getElementById(tweetId),
        tweetNum = tweetId.replace(/^tweet/, "");
    
    var req = new XMLHttpRequest();
    req.open("POST", "/edit/insert/");
    
    var datastring = encodeURIComponent("id") + "=" + encodeURIComponent(tweetNum);
    
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.setRequestHeader("Content-length", datastring.length);
    req.setRequestHeader("Connection", "close");
    req.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    
    req.onload = function(evt) {
        var result = JSON.parse(req.responseText);
        if(result == true) {
            document.location.reload();
        }
        else {
            //TODO: Add error catching here
        }
        
    }
    
    
    req.onerror = function(evt) {
        //TODO: Add error catching here
    }
    
    req.send(datastring);
    
}

function publishTweet(evt, elem) {
    var popup = document.getElementById("tweetpopup");
    var tweetId = popup.getAttribute("tweetId"),
        tweet = document.getElementById(tweetId),
        tweetText = tweet.getElementsByClassName("tweet_text")[0].textContent,
        tweetNum = tweetId.replace(/^tweet/, "");
    if(!window.confirm("Are you sure you want to publish this tweet immediately?\n\n" +
                      tweetText.substr(0,40) + (tweetText.length > 40 ? "..." : ""))) {
        return;
    }
    
    var req = new XMLHttpRequest();
    req.open("POST", "/edit/publish/");
    
    var datastring = encodeURIComponent("id") + "=" + encodeURIComponent(tweetNum) + "&" +
                     encodeURIComponent("textvalue") + "=" + encodeURIComponent(tweetText);
    
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.setRequestHeader("Content-length", datastring.length);
    req.setRequestHeader("Connection", "close");
    req.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
    
    req.onload = function(evt) {
        var result = JSON.parse(req.responseText);
        if(result == true) {
            document.location.reload();
        }
        else {
            //TODO: Add error catching here
        }
        
    }
    
    
    req.onerror = function(evt) {
        //TODO: Add error catching here
    }
    
    req.send(datastring);
}






