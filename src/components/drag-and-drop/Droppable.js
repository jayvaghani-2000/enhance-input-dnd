import classNames from "classnames";
import React, { useRef } from "react";

const Droppable = (props) => {
  const { children, ...rest } = props;
  const {
    activeDragOverRow,
    setActiveDragOverRow,
    rowId,
    draggedItemDimension,
    previousDraggedOverRow,
    dragXDifference,
    setDragXDifference,
    setPlaceholderIndex,
    placeholderIndex,
    draggedOverRow,
    rowBlock,
    handleDrop,
    setDraggedOverRow,
    draggedItem,
    setDraggedItem,
  } = rest;

  const droppableRef = useRef();

  const handleDragOverParent = (e, parentId) => {
    e.preventDefault();
    const draggedInitialClientX = e.clientX - dragXDifference;
    const children = [];
    let passPlaceholder = false;

    for (let i = 0; i < droppableRef.current.children.length; i++) {
      if (droppableRef.current.children[i].getBoundingClientRect().width) {
        if (
          droppableRef.current.children[i].classList.value ===
          "blockPlaceholder"
        ) {
          passPlaceholder = true;
          continue;
        }

        const { width, left } =
          droppableRef.current.children[i].getBoundingClientRect();
        children.push({
          width,
          left: passPlaceholder
            ? left - draggedItemDimension.current.width
            : left,
        });
      }
    }

    let indexForPlaceHolder = 0;
    for (let i = 0; i < children.length; i++) {
      const { width, left } = children[i];
      const elementMiddle = left + width / 2;
      if (draggedInitialClientX < elementMiddle) {
        indexForPlaceHolder = i;
        break;
      }
      indexForPlaceHolder = children.length;
    }

    if (placeholderIndex !== indexForPlaceHolder) {
      setPlaceholderIndex(indexForPlaceHolder);
    }

    if (previousDraggedOverRow.current !== parentId) {
      setDraggedOverRow(parentId);
      previousDraggedOverRow.current = parentId;
    }
    if (parentId !== activeDragOverRow) {
      setActiveDragOverRow(parentId);
    }
  };

  const handleDropEndCapture = (e) => {
    e.preventDefault();
    previousDraggedOverRow.current = "";
    setActiveDragOverRow(undefined);
    setDragXDifference(0);
  };

  const getDragOverClass = (row) => {
    return row.length > 0 ? "activeDragOverWithBlock" : "activeDragOver";
  };

  return (
    <div
      onDragOver={(e) => handleDragOverParent(e, rowId)}
      onDrop={(e) => {
        handleDrop(e, { draggedItem, draggedOverRow, placeholderIndex }, rowId);
        setDraggedOverRow("");
        setDraggedItem({});
      }}
      onDropCapture={handleDropEndCapture}
      ref={droppableRef}
      className={classNames("droppable", {
        [getDragOverClass(rowBlock)]: draggedOverRow === rowId,
        ["activeDragWithBlockOneBlock"]:
          draggedItem.parentId === rowId && rowBlock.length === 1,
      })}
    >
      {React.Children.map(
        children({ draggedItem, placeholderIndex, activeDragOverRow }),
        (child) => {
          return React.cloneElement(child, {
            ...rest,
            setDraggedItem: setDraggedItem,
            draggedItem: draggedItem,
          });
        }
      )}
    </div>
  );
};

export default Droppable;
