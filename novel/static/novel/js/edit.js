// Javascript for edit page

$(document).ready(function(evt) {
    
    // Scroll to bottom of tweet div
    var tweets = $("#tweets");
    tweets.scrollTop(tweets[0].scrollHeight);
    
    setWidths();
    
    $("#tweetpoup").hide();
    
    $(".unpublished").hover(hoverPopup, cleanPopup);
    $(".unpublished").click(editTweet);
    
    $("#inlineeditinput").blur(submitInlineEdit);
    $("#inlineeditinput").keypress(submitInlineEdit);
});

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

function submitInlineEdit(event) {
    var inputBox = $("#inlineeditbox"),
        input = $("#inlineeditinput");
    
    var tweetId = inputBox.attr("tweetId");
    
    var tweet = $("#"+tweetId),
        tweetText = tweet.find(".tweet_text"),
        tweetNum = tweetId.replace(/^tweet/, "");
    
    var newValue = input.val(),
        origValue = tweet.attr("originalText");
    
    if (event.type == "keypress") {
        if (event.keyCode == 27) {
            input.val(origValue);
            input[0].blur();
            return;
        }
        else if (event.keyCode != 13) {
            return;
        }
        else {
            input[0].blur();
            return;
        }
    }
    if(event.target != input[0]) {
        return;
    }
    
    if(newValue != origValue) {
        
        $.ajax({
            url: "/edit/inline/",
            type: "POST",
            data: {
                "id": tweetNum,
                "newcontent": input.val()
            },
            headers: {
                "X-CSRFToken": getCookie('csrftoken')
            },
            success: function(data, textStatus, xhr) {
                var result = JSON.parse(data);
                if(result == true) {
                    tweetText.text(input.val());
                    tweet.attr("originalText", input.val());
                }
                
                inputBox.hide();
                tweet.show();
                input.val("");
                inputBox.removeAttr("tweetId");
            },
            error: function(data, textStatus, xhr) {
                inputBox.hide();
                tweet.show();
                input.val("");
                inputBox.removeAttr("tweetId");
            }
        });
        
    }
    else {
        inputBox.hide();
        tweet.show();
        input.val("");
        inputBox.removeAttr("tweetId");
    }
    
}

function editTweet(evt) {
    var elem = $(this);
    
    var inputBox = $("#inlineeditbox"),
        input = $("#inlineeditinput");
    
    elem.before(inputBox);
    elem.hide();
    inputBox.show();
    
    var tweetId = elem.attr("id");
    inputBox.attr("tweetId", tweetId);
    
    input.val(elem.attr("originalText"));
    
    input[0].focus();
    input[0].select();
}

function hoverPopup(evt) {
    var elem = $(this)[0];
    var popup = $("#tweetpopup");
    popup.height($(this).height());
    var position = $(this).offset();
    var right = $("body")[0].clientWidth - (elem.offsetWidth + position.left);
    popup.css('top', position.top);
    popup.css('right', right + "px");
    popup.show();
    
    popup.attr("tweetId", elem.id);
}

function cleanPopup(evt) {
    var elem = $(this)[0];
    var popup = $("#tweetpopup");
    var related = evt.relatedTarget;
    if(!related) {
        return;
    }
    var relationship = related.compareDocumentPosition(popup[0]) & elem.DOCUMENT_POSITION_CONTAINS;
    if (relationship == 8 || related == popup[0]) {
        return;
    }
    
    popup.hide();
    
    popup.removeAttr("tweetId");
}

function deleteTweet(evt, elem) {
    var popup = $("#tweetpopup"),
        tweetId = popup.attr("tweetId"),
        tweet = $("#"+tweetId),
        tweetText = tweet.find(".tweet_text"),
        tweetNum = tweetId.replace(/^tweet/, "");
    
    if(!window.confirm("Are you sure you want to delete this tweet?\n\n" +
                      tweetText.text().substr(0,40) + (tweetText.text().length > 40 ? "..." : ""))) {
        return;
    }
    
    $.ajax({
        url: "/edit/delete/",
        type: "POST",
        data: {
            "id": tweetNum,
            "textvalue": tweetText.text()
        },
        headers: {
            "X-CSRFToken": getCookie('csrftoken')
        },
        success: function(data, textStatus, xhr) {
            var result = JSON.parse(data);
            if(result == true) {
                tweet.hide("fast", function() {
                    $(this).remove();
                });
            }
            else {
                //TODO: Add Error catching/display here
            }
        },
        error: function(data, textStatus, xhr) {
            //TODO: Add Error catching/display here
        }
    });
    
}

function insertTweet(evt, elem) {
    var popup = $("#tweetpopup"),
        tweetId = popup.attr("tweetId"),
        tweet = $("#"+tweetId),
        tweetNum = tweetId.replace(/^tweet/, "");
    
    $.ajax({
        url: "/edit/insert/",
        type: "POST",
        data: {
            "id": tweetNum
        },
        headers: {
            "X-CSRFToken": getCookie('csrftoken')
        },
        success: function(data, textStatus, xhr) {
            var result = JSON.parse(data);
            if(typeof result == "number") {
                var newTweet = tweet.clone(true),
                    newText = newTweet.find(".tweet_text");
                newTweet.attr("id", "tweet" + result);
                newTweet.attr("originalText", "new tweet");
                newText.text("new tweet");
                
                newTweet.hide();
                tweet.before(newTweet);
                newTweet.show("fast", function() {
                    $(this)[0].click();
                })
                
            }
            else if(result == true) {
                document.location.reload();
            }
            else {
                //TODO: Add Error catching/display here
            }
        },
        error: function(data, textStatus, xhr) {
            //TODO: Add Error catching/display here
        }
    });
    
}

function publishTweet(evt, elem) {
    var popup = $("#tweetpopup"),
        tweetId = popup.attr("tweetId"),
        tweet = $("#"+tweetId),
        tweetText = tweet.find(".tweet_text"),
        tweetNum = tweetId.replace(/^tweet/, "");
    
    if(!window.confirm("Are you sure you want to publish this tweet immediately?\n\n" +
                      tweetText.text().substr(0,40) + (tweetText.text().length > 40 ? "..." : ""))) {
        return;
    }
    
    $.ajax({
        url: "/edit/publish/",
        type: "POST",
        data: {
            "id": tweetNum,
            "textvalue": tweetText.text()
        },
        headers: {
            "X-CSRFToken": getCookie('csrftoken')
        },
        success: function(data, textStatus, xhr) {
            var result = JSON.parse(data);
            if(result == true) {
                tweet.toggleClass("unpublished published");
                tweetText.toggleClass("tweet_text publishedtext");
                tweet.off("hover click");
            }
            else {
                //TODO: Add Error catching/display here
            }
        },
        error: function(data, textStatus, xhr) {
            //TODO: Add Error catching/display here
        }
    });
}






