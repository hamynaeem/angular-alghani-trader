export function AddListFld(
  fldName,
  label,
  listTable,
  valueFld,
  displayFld,
  size,
  data: any = [],
  required = true,
  options: any = {}
) {
  return Object.assign(
    {
      fldName: fldName,
      control: 'select',
      type: 'list',
      label: label,
      listTable: listTable,
      listData: data,
      valueFld: valueFld,
      displayFld: displayFld,
      required: required,
      size: size,
    },
    options
  );
}
export function AddLookupFld(
  fldName,
  label,
  listTable,
  valueFld,
  displayFld,
  size,
  data: any = [],
  required = true,
  options: any = {}
) {
  return Object.assign(
    {
      fldName: fldName,
      control: 'select',
      type: 'lookup',
      label: label,
      listTable: listTable,
      listData: data,
      valueFld: valueFld,
      displayFld: displayFld,
      required: required,
      size: size,
    },
    options
  );
}
export function AddNGSelect(
  fldName,
  label,
  listTable,
  valueFld,
  displayFld,
  size,
  data: any = [],
  required = true,
  options: any = {}
) {
  return Object.assign(
    {
      fldName: fldName,
      control: 'select',
      type: 'ngselect',
      label: label,
      listTable: listTable,
      listData: data,
      valueFld: valueFld,
      displayFld: displayFld,
      required: required,
      size: size,
    },
    options
  );
}
export function AddDropDownFld(
  fldName,
  label,
  listTable,
  valueFld,
  displayFld,
  size,
  data: any = [],
  required = true,
  options: any = {}
) {
  return Object.assign(
    {
      fldName: fldName,
      control: 'select',
      type: 'dropdown',
      label: label,
      listTable: listTable,
      listData: data,
      valueFld: valueFld,
      displayFld: displayFld,
      required: required,
      size: size,
    },
    options
  );
}
export function AddComboBox(
  fldName,
  label,
  listTable,
  valueFld,
  displayFld,
  flds,
  size,
  data: any = [],
  required = true,
  options: any = {}
) {
  return Object.assign(
    {
      fldName: fldName,
      control: 'select',
      type: 'ng',
      label: label,
      endPoint: listTable,
      valueFld: valueFld,
      displayFld: displayFld,
      flds: flds,
      required: required,
      size: size,
      listData: data,
    },
    options
  );
}
export function AddInputFld(
  fldName,
  label,
  size,
  required = true,
  type = 'Text',
  options: any = {}
) {
  return Object.assign(
    {
      fldName: fldName,
      control: 'input',
      type: type,
      label: label,
      required: required,
      size: size,
    },
    options
  );
}
export function AddImage(fldName, label, size, required = false, options={}) {
  return  Object.assign({
    fldName: fldName,
    control: 'file',
    label: label,
    required: required,
    size: size,

  }, options);
}

export function AddCheckBox(
  fldName,
  label,
  size,
  required = true,
  cssClass = 'primary'
) {
  return {
    fldName: fldName,
    control: 'checkbox',
    class: cssClass,
    label: label,
    required: required,
    size: size,
  };
}
export function AddFormButton(
  label,
  onClick,
  size = 2,
  icon: null | string = null,
  cssClass = 'primary',
  options: any = {}
) {
  return Object.assign(
    {
      control: 'button',
      type: 'button',
      label: label,
      size: size,
      OnClick: onClick,
      cssClass: cssClass,
      icon: icon,
    },
    options
  );
}
export function AddTextArea(
  fldName: string,
  label: string,
  size = 6,
  required = true,
  options: any = {}
) {
  return Object.assign(
    {
      fldName: fldName,
      control: 'textarea',
      label: label,
      required: required,
      size: size,
      rows: 3,
    },
    options
  );
}
export function AddHTMLEditor(
  fldName: string,
  label: string,
  size = 6,
  required = true
) {
  return {
    fldName: fldName,
    control: 'html-editor',
    label: label,
    required: required,
    size: size,
  };
}
export function AddSpace(size) {
  return {
    fldName: '',
    control: 'space',
    label: '',
    size: size,
  };
}
export function FindCtrl(form: any, fldName: string) {
  return form.columns.find((x) => x.fldName == fldName);
}
export function FindCtrlIndex(form: any, fldName: string) {
  return form.columns.findIndex((x) => x.fldName == fldName);
}
export function SetDataSrc(form: any, fldName: string, data: any = []) {
  const ctrl = FindCtrl(form, fldName);
  if (ctrl) {
    ctrl.listData = data;
  }
}
export function FindButton(form: any, label: string) {
  return form.columns.find((x) => x.label == label);
}
