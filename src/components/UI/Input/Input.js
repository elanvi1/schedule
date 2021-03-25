import React from 'react';

import classes from './Input.module.css';

const input = (props) => {
  // Input or select elements are being rendered based on the props. The main one is formElementType which defines the type of element. 
  let elementType = null;

  //The input element and the label have a default. Other classes can be added via the inLine prop.
  let arrayClasses = [classes.InputElement];
  let labelClasses = [classes.Label];
 
  //If the input element is changed and the value isn't valid the Invalid class will be added
  if(props.isValid && props.isChanged){
    arrayClasses.push(classes.Invalid);
  }

  if(props.inLine){
    arrayClasses.push(classes.InLine);
    labelClasses.push(classes.InLine);
  }


  switch(props.formElementType){
    case 'input':
      elementType = <input 
        className={arrayClasses.join(' ')}
        {...props.attributes}
        value={props.value}
        onChange={props.changed}/>;
      break;
    case 'select':
      elementType = (
      <select 
        className={arrayClasses.join(' ')}
        {...props.attributes}
        onChange={props.changed}>
          {props.options.map((opt,i) =>(
            <option 
              key={opt+i}
              value={opt}>
              {opt}
            </option>
          ))}
      </select>
      );
      break;
    case 'selectConfig':
      elementType = (
        <select 
          className={arrayClasses.join(' ')}
          {...props.attributes}
          onChange={props.changed}>
            {props.options.map((opt,i) =>(
              <option 
                key={opt+i}
                value={opt.name+'___'+opt.userId}>
                {opt.name}
              </option>
            ))}
        </select>
        );
      break;
    case 'textarea':
      elementType = (
      <textarea 
      className={arrayClasses.join(' ')}
      {...props.attributes}
      onChange={props.changed}>{props.children}</textarea>
      )
      break;
    default:
      elementType = <input 
        className={arrayClasses.join(' ')}
        {...props.attributes}
        value={props.value}
        onChange={props.changed}/>
  }

  return (
    <div className={classes.Input}>
      <div>
        {props.noLabel ? null :<label 
          className={labelClasses.join(' ')}
          htmlFor={props.attributes.id}>
            {props.label + ' '} 
        </label>}
        {elementType}
      </div>

      {/* A warning message  is displayed via the warning prop*/}
      {props.isValid && props.isChanged && props.warning ?(
        <div className={classes.Warning}>*{props.warning}</div>
      ):null}
    </div>
  );
};

export default input;