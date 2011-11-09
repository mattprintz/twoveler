// Javascript for edit page

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
