import React, { useRef, useState } from "react";

const DragAndDropWrapper = (props) => {
  const { children } = props;
  const [dragXDifference, setDragXDifference] = useState(0);
  const [draggedOverRow, setDraggedOverRow] = useState("");
  const [draggedItem, setDraggedItem] = useState({});
  const [activeDragOverRow, setActiveDragOverRow] = useState();
  const [placeholderIndex, setPlaceholderIndex] = useState();
  const previousDraggedOverRow = useRef("");
  const draggedItemDimension = useRef();

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          dragXDifference,
          setDragXDifference,
          draggedOverRow,
          setDraggedOverRow,
          draggedItem,
          setDraggedItem,
          placeholderIndex,
          setPlaceholderIndex,
          previousDraggedOverRow,
          draggedItemDimension,
          activeDragOverRow,
          setActiveDragOverRow
        });
      })}
    </div>
  );
};

export default DragAndDropWrapper;
