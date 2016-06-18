import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import update from 'react-addons-update';
import { DropTarget } from 'react-dnd';
import { HotKeys } from 'react-hotkeys';
import _ from 'lodash';

import { ItemTypes } from '../constants';

import withEnabled from '../decorators/withEnabled';

function clamp(value, min, max) {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

const itemTarget = {
  drop(props, monitor, component) {
    if (!monitor.didDrop() && props.enabled) {
      props.onItemsReordered(component.state.items);
    }
  }
};

@withEnabled
@DropTarget(ItemTypes.PLAYLIST_ITEM, itemTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
export default class ListView extends Component {
  static propTypes = {
    enabled: PropTypes.bool,
    className: PropTypes.string,
    itemCreator: PropTypes.func.isRequired,
    onItemsReordered: PropTypes.func.isRequired,
    onItemsSelected: PropTypes.func,
    onItemRemoved: PropTypes.func,
    onItemActivated: PropTypes.func,
    connectDropTarget: PropTypes.func.isRequired
  };

  state = {
    items: [],
    selectedItems: [],
    focusedItemIndex: 0
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      items: nextProps.items.toArray()
    });
  }

  render() {
    const items = this.state.items;

    const {
      enabled,
      className,
      itemCreator,
      connectDropTarget
    } = this.props;

    const children = items.map((item, i) => {
      // Delegate item creation to the parent element.
      const child = itemCreator(item);

      const selected = (this.state.selectedItems.indexOf(item) >= 0);
      const focused = (this.state.focusedItemIndex === i);

      return React.cloneElement(child, {
        enabled: enabled,
        selected: selected,
        focused: focused,
        index: i,
        onItemClick: this.itemSelected,
        onItemDblClick: this.itemActivated,
        onReorder: this.reorder
      });
    }, this);

    const handlers = {
      up: this.itemSelectPrev,
      down: this.itemSelectNext,
      delete: this.itemsRemoved,
      activate: ev => {
        const item = _.first(this.state.selectedItems);

        if (item) {
          this.itemActivated(ev, item);
        }
      },
      selectAll: this.itemSelectAll,
      selectNone: this.itemSelectNone,
      selectLast: this.itemSelectLast,
      selectFirst: this.itemSelectFirst,
    };

    const content = connectDropTarget(
      <ul>
        {children}
      </ul>
    );

    return (
      <HotKeys handlers={handlers} className={className}>
        {content}
      </HotKeys>
    );
  }

  itemActivated = (e, item) => {
    if (this.props.onItemActivated && this.props.enabled) {
      this.props.onItemActivated(item);
    }

    e.preventDefault();
  };

  itemsRemoved = e => {
    if (this.props.onItemRemoved && this.props.enabled) {
      this.props.onItemRemoved(this.state.selectedItems);
    }

    e.preventDefault();
  };

  reorder = (index1, index2) => {
    const { items } = this.state;

    const item = items[index1];

    const stateUpdate = {
      items: {
        $splice: [
          [index1, 1],
          [index2, 0, item]
        ]
      }
    };

    this.setState(update(this.state, stateUpdate));
  };

  scrollIntoView = index => {
    const el = ReactDOM.findDOMNode(this);
    const rect = el.getBoundingClientRect();
    const itemRect = el.querySelectorAll('ul li')[index].getBoundingClientRect();

    const height = el.scrollHeight;
    const itemTop = itemRect.top - rect.top;

    let scrollTop = el.scrollTop;

    if (itemTop < 0) {
      scrollTop += itemTop;
    } else if (itemRect.bottom > rect.bottom) {
      scrollTop += itemRect.bottom - rect.bottom;
    }

    el.scrollTop = scrollTop;
  }

  itemSelected = (e, item) => {
    let selected = this.state.selectedItems;

    if (e.ctrlKey || e.metaKey) {
      selected = this.itemSelectToggle(item);
    } else if (e.shiftKey) {
      selected = this.itemSelectRangeTo(item);
    } else {
      selected = this.itemSelectOne(item);
    }

    this.setState({
      selectedItems: selected,
      focusedItemIndex: this.state.items.indexOf(item)
    });

    if (this.props.onItemsSelected) {
      this.props.onItemsSelected(selected);
    }
  };

  itemSelectAll = () => {
    this.setState({
      selectedItems: this.state.items
    });

    if (this.props.onItemsSelected) {
      this.props.onItemsSelected(this.state.items);
    }
  };

  itemSelectNone = () => {
    this.setState({
      selectedItems: []
    });

    if (this.props.onItemsSelected) {
      this.props.onItemsSelected([]);
    }
  };

  itemSelectOne(item) {
    return [item];
  }

  itemSelectToggle = item => {
    let items = this.state.selectedItems;

    // Toggle item on or off from the list.
    if (items.indexOf(item) >= 0) {
      items = _.without(items, item);
    } else {
      items.push(item);
    }

    return items;
  };

  itemSelectRangeTo = item => {
    const items = this.state.items;
    let selected = this.state.selectedItems;

    if (!selected.length) {
      this.itemSelectOne(item);
      return null;
    }

    const lastIndex = items.indexOf(_.last(selected));
    const itemIndex = items.indexOf(item);

    let addition;
    if (itemIndex >= lastIndex) {
      addition = items.slice(lastIndex, itemIndex + 1);
    } else {
      addition = items.slice(itemIndex, lastIndex + 1);
    }

    selected = _.uniq(selected.concat(addition));

    return selected;
  };

  itemSelectPrev = e => {
    const items = this.state.items;

    let item = items[this.state.focusedItemIndex - 1];

    if (!item) {
      item = _.first(items);
    }

    if (item) {
      this.scrollIntoView(clamp(this.state.focusedItemIndex - 1, 0, items.length - 1));

      this.itemSelected(e, item);
    }

    e.preventDefault();
  };

  itemSelectNext = e => {
    const items = this.state.items;

    let item = items[this.state.focusedItemIndex + 1];

    if (!item) {
      item = _.last(items);
    }

    if (item) {
      this.scrollIntoView(clamp(this.state.focusedItemIndex + 1, 0, items.length - 1));

      this.itemSelected(e, item);
    }

    e.preventDefault();
  };

  itemSelectFirst = e => {
    const items = this.state.items;

    const item = _.first(items);

    if (item) {
      this.itemSelected(e, item);
    }
  };

  itemSelectLast = e => {
    const items = this.state.items;

    const item = _.last(items);

    if (item) {
      this.itemSelected(e, item);
    }
  };
}
