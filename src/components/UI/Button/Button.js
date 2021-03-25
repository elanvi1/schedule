import React from 'react';

import classes from './Button.module.css'

const button = (props) => {
  // The Button comp can have different styling depending on the btnType prop.
  let myClasses =[classes.Button];
  let addedClasses = props.btnType.split(' ');

  addedClasses.forEach(name => {
    myClasses.push(classes[name]);
  });

  if(props.noShow){
    myClasses.push(classes.NoShow);
  }
  return (
  <button
  className ={myClasses.join(' ')}
  onClick={props.clicked}
  disabled={props.disabled}>{props.children}</button>
  );
};

export default button;