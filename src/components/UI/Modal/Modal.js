import React from 'react';

import classes from './Modal.module.css';
import Backdrop from '../BackDrop/BackDrop';

const modal = (props) => {

  return (
    <>
      <Backdrop 
        shouldShow={props.noBackdrop ? false : props.shouldShow}
        clicked={props.closeModal}/>
      <div 
        className={props.wider ? classes.Wider :classes.Modal} 
        style={{
          transform: props.shouldShow ? 'translateY(0)':'translateY(-100vh)',
          opacity: props.shouldShow ? '1':'0'
          }}>
          {props.children}
      </div>
    </>
  );
};

export default modal;