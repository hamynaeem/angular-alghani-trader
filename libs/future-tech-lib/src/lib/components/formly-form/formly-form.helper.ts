export function AddLookupFld(fldName, label, listTable, valueFld, displayFld, size, data:any= [], required= true) {
  return {
    fldName: fldName, control: 'select', type: 'lookup', label: label,
    listTable: listTable, listData: data, valueFld: valueFld, displayFld:
      displayFld, required: required, size: size
  }
}
export function AddInputFld(fldName, label, size, required = true, type = 'Text') {
  return {
    fldName: fldName, control: 'input', type: type, label: label,
    required: required, size: size
  }
}
export function AddFormButton(label, onClick, size = 2, icon: null | string = null, cssClass = 'primary') {
  return {
    control: 'button', type: 'button', label: label,
    size: size, OnClick: onClick, cssClass: cssClass, icon: icon
  }
}
export function AddTextArea(fldName: string, label: string, size = 6, required = true) {
  return {
    fldName: fldName, control: 'textarea', label: label,
    required: required, size: size
  };
}

