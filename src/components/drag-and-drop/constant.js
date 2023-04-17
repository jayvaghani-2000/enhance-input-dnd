export const groupCardRowWise = (rows) => {
  const groupByRows = rows.reduce((group, child) => {
    const { row } = child;
    group[row] = group[row] ?? [];
    group[row].push(child);
    return group;
  }, {});

  const sortedCard = Object.values(groupByRows).reduce((prev, curr, index) => {
    prev[index] = curr.sort((a, b) => a.col - b.col);
    return prev;
  }, {});

  return Object.values(sortedCard).reduce(
    (prev, curr, index) => {
      prev[2 * index + 1] = curr;
      prev[2 * index + 2] = [];
      return prev;
    },
    {
      0: [],
    }
  );
};

const getSortedByColRows = (groups, dragElement, isSameRowAndMoveRight) => {
  return groups.map((group) => {
    const sorted = group.sort((a, b) => {
      if (a.col === b.col) {
        if (dragElement.item.id === a.id) {
          return isSameRowAndMoveRight ? 1 : -1;
        } else {
          return isSameRowAndMoveRight ? -1 : 1;
        }
      }
      return a.col - b.col;
    });
    return sorted;
  });
};

export const reArrangeAfterDrop = (
  cards,
  selectedBlock,
  targetRow,
  dragElement,
  isSameRowAndMoveRight
) => {
  cards.forEach((i, index) => {
    if (index !== selectedBlock) {
      if (
        i.col >= cards[selectedBlock].col &&
        i.row === cards[selectedBlock].row &&
        targetRow !== i.row
      ) {
        i.col += 1;
      }

      if (i.row >= Math.round(targetRow) && !Number.isInteger(targetRow)) {
        i.row += 1;
      }
    }
  });

  const rowBlockGroup = cards.reduce((prev, card) => {
    const { row } = card;
    prev[row] = prev[row] ?? [];
    prev[row].push(card);
    return prev;
  }, []);
  const sortedByColumn = getSortedByColRows(
    rowBlockGroup,
    dragElement,
    isSameRowAndMoveRight
  );

  const rearranged = sortedByColumn.map((group) => {
    group.forEach((block, index) => {
      if (block.row === targetRow) {
      } else {
      }
      block.col = index;
    });
    return group;
  });
  return rearranged.flat();
};
