// ==UserScript==
// @name         CAL Decodde Base64 content
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Decode the CAL conent encoded in base64
// @author       jayka
// @match        https://engineering.paypalcorp.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @run-at       document-idle
// @downloadURL  https://raw.githubusercontent.com/jayka/tampermonkey-scripts/main/CAL%20Decodde%20Base64%20content.js
// @updateURL    https://raw.githubusercontent.com/jayka/tampermonkey-scripts/main/CAL%20Decodde%20Base64%20content.js
// ==/UserScript==

function getContentNumOfTr(trNode) {
    return getContentNumOfTd(trNode.lastChild);
}

function getContentNumOfTd(tdNode) {
    if(tdNode.innerHTML.startsWith("content")) {
        return parseInt(tdNode.innerHTML.match(/content(..?)=/)[1]);
    } else {
        return NaN;
    }
}

function getContentOfTD(tdNode) {
    return tdNode.innerHTML.match(/content..?=(.*)/)[1];
}

function getAllContentTDs(firstTrNode) {
    let trNode = firstTrNode;
    const tdNodes = [];
    const trNodes = [];
    let base64Content = "";
    let decodedContent = "";
    while(!isNaN(getContentNumOfTr(trNode)) && !(getContentNumOfTr(trNode) ===0 && tdNodes.length > 0)
         && getContentNumOfTr(trNode) == tdNodes.length) {
        const tdNode = trNode.lastChild;
        tdNodes.push(tdNode);
        trNodes.push(trNode);
        base64Content += getContentOfTD(tdNode);

        trNode = trNode.nextSibling;
    }

    if(base64Content !== "") {
        if(base64Content.match(/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/)) {
            decodedContent = atob(base64Content);
        }
    }

    if(decodedContent === "") return {};
    return {trNodes, tdNodes, content: decodedContent};
}

function getFirstTr(trNode) {
    let contentNum = getContentNumOfTr(trNode);
    if(contentNum === NaN) return null;

    while(contentNum = getContentNumOfTr(trNode)){
        trNode = trNode.previousSibling
    }

    return contentNum === 0 ? trNode : null;
}

function decodeTr(tr) {
    while(tr.nodeName !== 'TR') {
        tr = tr.parentNode
    }

    const firstTr = getFirstTr(tr);
    if(firstTr) {
        const {trNodes, tdNodes, content } = getAllContentTDs(firstTr);

        if(tdNodes) {
            tdNodes[0].innerHTML = "";
            tdNodes[0].appendChild(document.createTextNode(content));
            for(let i=1; i<tdNodes.length; i++){
                tdNodes[i].remove()
            }
        }
    }
}

function getAllTDContent0Nodes() {
    return [...document.querySelectorAll("td.data")].filter(node => getContentNumOfTd(node) === 0)
}

function getAllTRsOfTDContent0Nodes() {
    return getAllTDContent0Nodes().map(node => node.parentNode);
}

(function() {
    //const selection = document.getSelection();
    //if(!selection || !selection.anchorNode) return;

    //let tr = selection.anchorNode

    // do this to the whole document
    getAllTRsOfTDContent0Nodes().forEach(tr => decodeTr(tr));

})();
