import classNames from "classnames";
import React, { useRef } from "react";

const Draggable = (props) => {
  const {
    item,
    index,
    parent,
    draggedItem,
    setDragXDifference,
    setDraggedItem,
    setDraggedOverRow,
    previousDraggedOverRow,
    setActiveDragOverRow,
    draggedItemDimension,
    children,
  } = props;

  const handleDragStart = (event, item) => {
    setDragXDifference(
      event.clientX - event.target.getBoundingClientRect().left
    );
    draggedItemDimension.current = event.target.getBoundingClientRect();
    setDraggedItem(item);
    event.target.style.boxShadow =
      "inset 0 0 40px 1px rgba(166, 170, 204, 0.6)";
    event.target.style.background = "rgba(189, 181, 213,0.1)";
  };

  const draggedElementRef = useRef();

  const handleDrag = (e, items) => {
    if (draggedElementRef.current) {
      draggedElementRef.current.classList.add("handleRemoveSelectedElement");
    }
  };

  const handleDragEnd = (e) => {
    e.target.style = null;
    if (draggedElementRef.current) {
      draggedElementRef.current.classList.remove("handleRemoveSelectedElement");
    }
    setDraggedItem({});
    setDraggedOverRow("");
    previousDraggedOverRow.current = "";
    setActiveDragOverRow(undefined);
    setDragXDifference(0);
  };

  return item.id === "placeholder" ? (
    <div
      className="blockPlaceholder"
      style={{ width: `${draggedItemDimension.current.width}px` }}
    ></div>
  ) : (
    <div
      className={classNames("draggableBlock", {
        ["makeBlockVisible"]: Object.keys(draggedItem).length === 0,
      })}
      id={item.id}
      draggable
      onDragStart={(e) => handleDragStart(e, { item, index, parentId: parent })}
      ref={draggedElementRef}
      onDrag={(e) => handleDrag(e, { item, index, parentId: parent })}
      onDragEnd={handleDragEnd}
    >
      {children}
    </div>
  );
};

export default Draggable;
