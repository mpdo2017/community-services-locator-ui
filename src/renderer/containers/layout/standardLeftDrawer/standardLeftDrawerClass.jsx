import React from 'react';
import PropTypes from 'prop-types';
import Flexbox from 'flexbox-react';
import { omit } from 'ramda';

import Checkbox from 'react-toolbox/lib/checkbox';
import { selectedServices } from 'redux-modules/services/paths';

import { router } from 'src/renderer';
import { ROUTE_VIEW_MAP } from 'redux-modules/router/constants';

export default class StandardLeftDrawer extends React.Component {
  static defaultProps = {
    openCategory: null,
  };

  static propTypes = {
    children: PropTypes.object.isRequired,
    getServiceLocations: PropTypes.func.isRequired,
    openCategory: PropTypes.string,
    selectedServices: PropTypes.object.isRequired,
    set: PropTypes.func.isRequired,
  };

  state = { allChecked: false };

  _renderSubCategories = taxId => {
    const result = [];
    const filteredItems = this.props.children[taxId] || [];

    filteredItems.forEach(child => {
      const itemChecked = this.props.selectedServices[taxId]
        ? this.props.selectedServices[taxId][child.id] || false
        : false;

      result.push(
        <Flexbox
          key={`subItem-${child.id}`}
          className="subItems"
          justifyContent="flex-start"
          alignItems="center">
          <Checkbox
            checked={itemChecked}
            label={child.description}
            onChange={value => {
              this.props.set(
                this._getServices(child, value, this.props.selectedServices),
                selectedServices
              );
            }}
          />
        </Flexbox>
      );
    });
    return result;
  };

  _renderCategories = () => {
    return (
      <Flexbox
        className="cat-row"
        flexDirection="column"
        alignItems="flex-start"
        justifyContent="center">
        {this._renderSubCategories(this.props.openCategory)}
      </Flexbox>
    );
  };

  _getServices = (child, value, services = {}) => {
    const taxId = this.props.openCategory;
    this.props.getServiceLocations(child.id, value);
    let taxSpread = services[taxId];
    if (!value) {
      // unchecked, so omit from array.
      taxSpread = omit([child.id], taxSpread);
    } else {
      taxSpread = {
        ...taxSpread,
        [child.id]: value,
      };
    }
    const updateData = {
      ...services,
      [taxId]: taxSpread,
    };

    router.navigate(ROUTE_VIEW_MAP, {
      cat: this.props.openCategory,
      sub: child.id,
    });

    return updateData;
  };

  _selectAll() {
    return (
      <Flexbox
        key="selectAll"
        className="subItems mb15"
        justifyContent="flex-start"
        alignItems="center">
        <Checkbox
          checked={this.state.allChecked}
          label="SELECT ALL"
          onChange={value => {
            this.setState(prev => ({ allChecked: !prev.allChecked }));
            const taxId = this.props.openCategory;
            const filteredChildren = this.props.children[taxId] || [];
            let services = this.props.selectedServices;
            filteredChildren.forEach(child => {
              services = this._getServices(child, value, services);
            });
            this.props.set(services, selectedServices);
          }}
        />
      </Flexbox>
    );
  }

  render() {
    return (
      <Flexbox className="left-drawer" flexDirection="column">
        {this._selectAll()}
        {this._renderCategories()}
      </Flexbox>
    );
  }
}