import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Alert = ({ alerts }) =>
  // Check if alerts are not null and they also contain text
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map((alert) => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));

Alert.propTypes = { alerts: PropTypes.array.isRequired };

const mapStateToProps = (state) => ({
  // state.alert comes from alert.js reducer, via rootReducer
  alerts: state.alert
});

export default connect(mapStateToProps)(Alert);
