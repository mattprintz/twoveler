// Javascript for edit page

function submitInlineEdit(event) {
    var box = event.target;
    box.textNode.textContent = box.value;
    box.origElem.setAttribute("originalText", box.value);
    box.origElem.hidden = false;
    box.parentNode.removeChild(box);
    
}

function editTweet(elem) {
    var box = document.createElement("input");
    var textNode = elem.getElementsByClassName("tweet_text")[0];
    
    box.setAttribute("class", "inlineeditbox");
    box.value = elem.getAttribute("originalText");
    box.textNode = textNode;
    box.origElem = elem;
    elem.hidden = true;
    elem.parentNode.insertBefore(box, elem);
    box.focus();
    box.select();
    box.addEventListener("blur", submitInlineEdit, false);
    //box.addEventListener("keypress", submitInlineEdit, false);
}
