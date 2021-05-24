const { ipcRenderer } = require('electron');
const docReady = require('doc-ready');
let promptId, promptOptions;

window.onerror = (error) => {
    if(promptId) {
        promptError("An error has occured on the prompt window: \n"+error);
    }
};

const promptError = (e) => {
    if(e instanceof Error) {
        e = e.message;
    }
    ipcRenderer.sendSync('prompt-error:'+promptId, e);
}

const promptCancel = () => {
    ipcRenderer.sendSync('prompt-post-data:'+promptId, null);
}

const promptSubmit = () => {
    const dataContainerEl = document.getElementById('data-container');
    const dataEl = document.getElementById('data');
    let data = null;

    if(promptOptions.type === 'input') {
        data = dataEl.value
    } else if(promptOptions.type === 'select') {
        if(promptOptions.selectMultiple) {
            data = dataEl.querySelectorAll('option[selected]').map((o) => o.getAttribute('value'));
        } else {
            data = dataEl.value;
        }
    } else if (promptOptions.type === 'multi-input') {
        var array = dataContainerEl.getElementsByTagName('input')
        data = {};
        for (var i = 0; i < array.length; i++) {
            const isRequired = array[i].getAttribute('required') === "true";
            if (isRequired && (!array[i].value || array[i].value.length < 1)) {
                data = null;
                break;
            }
            data[array[i].id] = array[i].value;
        }
    }
    ipcRenderer.sendSync('prompt-post-data:'+promptId, data);
}

docReady(() => {
    promptId = document.location.hash.replace('#','');

    try {
        promptOptions = JSON.parse(ipcRenderer.sendSync('prompt-get-options:'+promptId));
    } catch(e) {
        return promptError(e);
    }

    if (promptOptions.disableInitialLabel) {
        document.getElementById("label").style.visibility = 'none';
        document.getElementById("label").style.height = 0;
    }
    document.getElementById("label").textContent = promptOptions.label;
    document.getElementById("ok").addEventListener('click', () => promptSubmit());
    document.getElementById("cancel").addEventListener('click', () => promptCancel());

    if (promptOptions.buttonsStyle) {
        document.getElementById("ok").style.color = promptOptions.buttonsStyle.ok_color;
        document.getElementById("cancel").style.color = promptOptions.buttonsStyle.cancel_color;
        document.getElementById("ok").style.backgroundColor = promptOptions.buttonsStyle.ok_bg_color;
        document.getElementById("cancel").style.backgroundColor = promptOptions.buttonsStyle.cancel_bg_color;
        if (promptOptions.buttonsStyle.textes) {
            document.getElementById("ok").innerHTML = promptOptions.buttonsStyle.textes.ok_txt;
            document.getElementById("cancel").innerHTML = promptOptions.buttonsStyle.textes.cancel_txt;
        }
    }

    const dataContainerEl = document.getElementById('data-container');

    let dataEl;
    if(promptOptions.type === 'input') {
        dataEl = document.createElement('input');
        dataEl.setAttribute('type', 'text');

        if(promptOptions.value) {
            dataEl.value = promptOptions.value;
        } else {
            dataEl.value = '';
        }

        if(promptOptions.inputAttrs && typeof(promptOptions.inputAttrs) === 'object') {
            for(let k in promptOptions.inputAttrs) {
                if(!promptOptions.inputAttrs.hasOwnProperty(k)) continue;

                dataEl.setAttribute(k, promptOptions.inputAttrs[k]);
            }
        }

        dataEl.addEventListener('keyup', (e) => {
            e.which = e.which || e.keyCode;
            if(e.which == 13) {
                promptSubmit();
            }
        });
    } else if(promptOptions.type === 'select') {
        dataEl = document.createElement('select');
        let optionEl;

        for(let k in promptOptions.selectOptions) {
            if(!promptOptions.selectOptions.hasOwnProperty(k)) continue;

            optionEl = document.createElement('option');
            optionEl.setAttribute('value', k);
            optionEl.textContent = promptOptions.selectOptions[k];
            if(k === promptOptions.value) {
                optionEl.setAttribute('selected', 'selected');
            }
            dataEl.appendChild(optionEl);
        }
    } else if (promptOptions.type === 'multi-input') {
        dataEl = null;
        for (var i = 0; i < promptOptions.inputArray.length; i++) {
            var tmp_elem = promptOptions.inputArray[i];
            var tmp_label = document.createElement('div')
            tmp_label.innerHTML = tmp_elem.label || tmp_elem.key + ((tmp_elem.required) ? '*' : '');
            tmp_label.classList.add('label')
            var tmp_input = document.createElement('input')
            tmp_input.classList.add('data')
            if (tmp_elem.attributes  && typeof(tmp_elem.attributes) === 'object') {
                for(let k in tmp_elem.attributes) {
                    if(!tmp_elem.attributes.hasOwnProperty(k)) continue;
                    tmp_input.setAttribute(k, tmp_elem.attributes[k]);
                }
            }
            if (tmp_elem.value) {
                tmp_input.value = tmp_elem.value;
            } else {
                tmp_input.value= '';
            }
            tmp_input.setAttribute('id', tmp_elem.key);
            dataContainerEl.appendChild(tmp_label)
            dataContainerEl.appendChild(tmp_input)
        }
    }

    if (dataEl) {
        dataContainerEl.appendChild(dataEl);
        dataEl.setAttribute('id', 'data');

        dataEl.focus();
    }

});
