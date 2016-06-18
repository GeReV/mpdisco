import React, { Component, PropTypes } from 'react';
import update from 'react-addons-update';
import { DropTarget } from 'react-dnd';
import _ from 'lodash';

// import HotKey from 'react-hotkey';

import { ItemTypes } from '../constants';

import withEnabled from '../decorators/withEnabled';

// HotKey.activate('keydown');

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

    return connectDropTarget(
      <ul className={className}>
        {children}
      </ul>
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

  handleKeyboard = e => {
    if (!this.props.enabled) {
      return;
    }

    const funcs = {
      'Delete': this.itemsRemoved,
      'Enter': ev => {
        const item = _.first(this.state.selectedItems);

        if (item) {
          this.itemActivated(ev, item);
        }
      },
      'Home': ev => {
        this.itemSelectFirst(ev);

        ev.preventDefault();
      },
      'End': ev => {
        this.itemSelectLast(ev);

        ev.preventDefault();
      },
      'ArrowUp': this.itemSelectPrev,
      'ArrowDown': this.itemSelectNext,

      65: ev => { // Ctrl+A
        if (ev.ctrlKey) {
          this.itemSelectAll();

          ev.preventDefault();
        }
      },
      68: ev => { // Ctrl+D
        if (ev.ctrlKey) {
          this.itemSelectNone();

          ev.preventDefault();
        }
      }
    };

    const fn = funcs[e.key] || funcs[e.keyCode];

    if (fn) {
      fn.call(this, e);
    }
  }

  scrollIntoView = item => {
    const height = this.ui.playlist.height();
    const itemTop = item.position().top;
    const itemHeight = item.outerHeight();

    let scrollTop = this.ui.playlist.prop('scrollTop');

    if (itemTop < 0) {
      scrollTop += itemTop;
    } else if (itemTop + itemHeight > height) {
      scrollTop -= height - itemTop - itemHeight;
    }

    this.ui.playlist.prop('scrollTop', scrollTop);
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
      this.itemSelected(e, item);
    }
  };

  itemSelectNext = e => {
    const items = this.state.items;

    let item = items[this.state.focusedItemIndex + 1];

    if (!item) {
      item = _.last(items);
    }

    if (item) {
      this.itemSelected(e, item);
    }
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
