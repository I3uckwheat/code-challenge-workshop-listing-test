import React, { Component } from 'react';

import './WorkshopDisplay.css';

import WorkshopItem from '../WorkshopItem/WorkshopItem';

class WorkshopDisplay extends Component {
  constructor(props) {
    console.log('Constructing WorkshopDisplay ...');
    super(props);

    // TODO-code-challenge: Bonus: As a User, I can display the list of preferred workshops
    this.state = {
      data: []
    };

    let unlisten = this.props.history.listen((location, action) => {
      console.log('history refresh');
      if (location.pathname.includes('preferred') || location.pathname.includes('nearby')) {
        this.refreshWorkshops(location.pathname);
      }
    });
    this.stopHistoryUnlisten = unlisten;
  }

  componentDidMount() {
    console.log('WorkshopDisplay did mount');

    this.refreshWorkshops(this.props.location.pathname);
  }

  componentWillUnmount() {
    console.log('WorkshopDisplay Will unmount');
    this.stopHistoryUnlisten();
  }

  pathNameToTitle () {
    if (this.props.location.pathname.includes('nearby')) {
      return "Nearby"
    } else if (this.props.location.pathname.includes('preferred')) {
      return "Preferred";
    } else {
      return "";
    }
  }

  handleItemUnmount (id) {
    console.log(`Removing item ${id}`);
    let res = this.state.data.filter (item => {
      return item.props.id !== id;
    });
    this.setState({
      ...this.state,
      data: res
    })
  }

  fetchWorkshops (url) {
    let workshops = [];
    let isPreferred = !url.includes('nearby');
    fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then ( (resp) =>  resp.json() )
    .then ( (data) => {
      console.log(data);
      this.setState({data});
    })
    .catch( (err) => {
      console.error(err);
    });
  }

  refreshWorkshops (mode) {
    let url = "";

    if (!localStorage.getItem('token')) {
      this.props.history.push('/signin');
    }

    if (mode === '/workshops/nearby') {
      console.log('nearby');

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition( (position) => {
          console.log(position.coords.longitude, position.coords.latitude);
          url = `http://localhost:3000/api/v1/workshops/nearby?x=${position.coords.longitude}&y=${position.coords.latitude}`;
          this.fetchWorkshops(url);
        }, (err) => {
          console.log('No permission for geolocation.');
          url = `http://localhost:3000/api/v1/workshops/nearby`;
          this.fetchWorkshops(url);
        });
      } else {
        console.log("Geolocation is not supported.");
        url = `http://localhost:3000/api/v1/workshops/nearby`;
        this.fetchWorkshops(url);
      }

    } else if (mode === '/workshops/preferred') {
      // TODO-code-challenge: Bonus: As a User, I can display the list of preferred workshops
    } else {
      this.props.history.push('/workshops/nearby');
    }
  }

  render() {
    return (
      <div className="WorkshopDisplay">
        <div>
          <h1 className="title">Nearby Workshops</h1>
        </div>
        <div>
          { 
            this.state.data.map(workshop => (
              <WorkshopItem 
                name={workshop.name}
                img={workshop.picture}
                id={workshop._id}
              />
            ))
          }
        </div>
      </div>
    );
  }
}

export default WorkshopDisplay;
