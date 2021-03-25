import React,{Component} from 'react';
import FontAwesome from 'react-fontawesome';

import classes from './ScheduleItem.module.css';
import Modal from '../../../components/UI/Modal/Modal';

class ScheduleItem extends Component{
  // Each ScheduleItem goes through the information of its respective day object from the schedule. That information is represented by the shifts and the employee names for each shift for that day. Based on that information the visual interface is created.
  state= {
    showShift:{}
  }

  componentDidMount(){
    if(Object.keys(this.props.el.info).length > 0){
      let shifts = {};

      for(let shift in this.props.el.info){
        shifts[shift] = false;
      };

      this.setState({showShift:shifts});
    };
  }

  toggleShowShift = (shiftName) => {
    this.setState(prevState => {
      return {
        showShift:{
          ...this.state.showShift,
          [shiftName]:!prevState.showShift[shiftName]
        }
      };  
    });
  }

  //By clicking on an employee on the schedule the user will be taken to that employee tab where more information about him is presented
  clickNameHandler = (name,userId) => {
    let urlName = name.replace(/ /g,'_')
    this.props.history.push('/employees/' + urlName +'/' + userId);
  }
  
  render(){
    let infoArray = [];
    let myClasses = [classes.Item];

    if(!this.props.expanded){
      myClasses.push(classes.ItemNoExp);
    }

    for(let shift in this.props.el.info){
      infoArray.push({...this.props.el.info[shift],name:shift});
    }

    infoArray = infoArray.sort((el1,el2)=>{
      if(el1.value){
        return el1.value.localeCompare(el2.value)
      }else{
        return 0;
      }
    })

    let body = (
      <div className={myClasses.join(' ')}>
        <div style={{fontSize:'22px',color:'purple',textAlign:'center'}}>
          <strong>{`${this.props.j-1}. `}</strong>
          <em>{this.props.timeExp}</em> 
        </div>

        
        {this.props.el.info === 'empty' ? null :infoArray.map((cur,i)=>{
          return (
            <div key={this.props.el.id + cur.value}style={{display:'flex',flexDirection:'column',margin:'15px 0'}}>
              <div style={{display:'flex', justifyContent:'space-around',alignItems:'center'}}>
                <div style={{alignSelf:'center',fontWeight:'bold',fontSize:'18px',margin:'10px 0'}}>{cur.value}</div>

                {this.state.showShift[cur.name] ?  <FontAwesome name='minus-square' size='2x' className={classes.Minus} onClick={this.toggleShowShift.bind(this,cur.name)}/>: 
                <FontAwesome name='plus-square' size='2x' className={classes.Plus} onClick={this.toggleShowShift.bind(this,cur.name)}/>}
              </div>
              {this.state.showShift[cur.name] ?<div >
                {cur.empls.map(c=><div key={this.props.el.id+c.name}className={classes.Name} onClick={this.clickNameHandler.bind(this,c.name,c.userId)}>{c.name}</div>)}
              </div> : null}
            </div>
          )
        })}
        
      </div>
    )

    let modal = this.props.expanded ? null : (
      <Modal
        shouldShow={this.props.show}
        closeModal={this.props.toggleShowDay}>
        {body}
      </Modal>
    );

    let main = (
        <div 
          onClick={this.props.toggleShowDay}
          className={classes.MinDay}>
            <strong>{this.props.j-1} . </strong>{this.props.time}
        </div>
    )

    if(this.props.expanded){
      main = body;
    }
  
    return(
      <>
        {main}
        {modal}
      </>
    );
  }
};

export default ScheduleItem;