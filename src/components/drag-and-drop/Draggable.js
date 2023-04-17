import classNames from "classnames";
import React, { useRef } from "react";

const DraggableItem = (props) => {
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
    event.target.style.boxShadow = "inset 0 0 10px 10px rgba(39, 43, 84, 0.5)";
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
      className={classNames("block", {
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

export default DraggableItem;
