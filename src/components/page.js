import React, { useEffect, useState } from 'react'
import store from '../store/rootStore'
import rowColArray from './rowColArrayUtils'
import { observer } from "mobx-react"
import { Block } from './block'
import './page.css'
import DragAndDropWrapper from './drag-and-drop/DragAndDropWrapper'
import Droppable from './drag-and-drop/Droppable'
import Draggable from './drag-and-drop/Draggable'
import { groupCardRowWise, reArrangeAfterDrop } from './drag-and-drop/constant'
import { runInAction } from 'mobx'

const Page = observer(props => {
  const { clientXRef } = props;
  const [blocks, setBlock] = useState([])

    const getSortedBlockArray = _ => rowColArray.getRowOrderedColOrderedArray(store.blocksForCurrentPage)

    useEffect(() => {
      if(store.blocksForCurrentPage.length) {
        setBlock(store.blocksForCurrentPage)
      }
    }, [store.blocksForCurrentPage])

    const onReturnKeyPressed = async block => {
        if (block) {
            // it's coming from a non dummy block we need to give the focus to the next block
            const nextBlock = rowColArray.getNextRowBlock(store.blocksForCurrentPage, block.row)
            if (nextBlock) store.setFocusedBlockId(nextBlock.id)
            else {
                // it was the last block, need to update it and add a new dummy one
                await store.updateBlock(block.id, block.content, 'none')
            }
        }
    }

    const onHandleMenuAction =  async ({ id, action, data }) => {
        let blockIdToFocus = id
        let block = store.findBlockInCurrentPage(id)

        if (block === undefined) {
            console.warn('tried to handle unknown block ' + id)
            return
        }

        switch (action) {
            case 'deleteBlock':
                store.blocksForCurrentPage = store.blocksForCurrentPage.filter(b => b.id !== id)
                
                let blockToFocus = store.blocksForCurrentPage.filter(b => b.row === block.row).sort((a, b) => a.col - b.col)
                if (blockToFocus.length === 0)
                    blockToFocus = store.blocksForCurrentPage.filter(b => b.row === block.row).sort((a, b) => a.col - b.col)
                
                if (blockToFocus.length >= 0)
                    store.focusedBlockId = blockToFocus[0].id
                break
            case 'moveBlockUp':
                await store.moveBlockUp(id)
                break
            case 'moveBlockDown':
                await store.moveBlockDown(id)
                break
            case 'insertBlockAbove':
                await store.insertBlockAbove(id)
                break
            case 'insertBlockBelow':
                await store.insertBlockBelow(id)
                break
            case 'insertBlockRight':
                await store.insertBlockRight(id)
                break
            case 'insertBlockLeft':
                await store.insertBlockLeft(id)
                break
            case 'moveBlockRight':
                await store.moveBlockRight(id)
                break
            case 'moveBlockLeft':
                await store.moveBlockLeft(id)
                break
            case 'copyBlock':
               /* const block = store.findBlockInCurrentPage(id)
                if (block) {
                    const newBlock = createNewEmptyBlock()
                    newBlock.type = block.type
                    newBlock.content = block.content
                    store.insertBelow(id, newBlock)
                    blockIdToFocus = newBlock.id
                }*/
                break
            default:
                console.error('Got unknown action from block menu ' + action)
        }
        if (blockIdToFocus !== id) {
            store.setFocusedBlockId(blockIdToFocus)
        }
    }

    const onChange = async title => {
        // TODO need to handle multiple trottle
        await store.updatePage({ title })
    }

    const handleDropBlock = async(e, draggedInfo) => {
      e.preventDefault();
      e.target.style = null;

      const { draggedItem, draggedOverRow, placeholderIndex, setDraggedOverRow, setDraggedItem  } = draggedInfo;
      if (Object.keys(draggedItem).length === 0) {
        return;
      }
      const targetIndex = placeholderIndex === -1 ? 0 : placeholderIndex;
      runInAction(async () => {
        const updatedParents = blocks;
        const selectedBlock = updatedParents.findIndex(
          (i) => i.id === draggedItem.item.id
        );
        const dropOnRow = +(draggedOverRow - 1) / 2;
        const isDropOnSameRow = draggedItem.item.row === dropOnRow;
        const draggedRowBlock = updatedParents.filter(
          (i) => Number.isInteger(dropOnRow) && i.row === dropOnRow
        );
    
        updatedParents[selectedBlock].row = Math.round(dropOnRow);
        updatedParents[selectedBlock].col =
          targetIndex > draggedRowBlock.length
            ? draggedRowBlock.length
            : +targetIndex;
    
        const reArrangedBlock = reArrangeAfterDrop(
          updatedParents,
          selectedBlock,
          dropOnRow,
          draggedItem,
          draggedItem.index < placeholderIndex && isDropOnSameRow
        );
        await store.dragBlockToNewPlace(reArrangedBlock);
        setBlock(reArrangedBlock);
      })
      setDraggedOverRow("");
      setDraggedItem({});
    };

    const addPlaceholderHelper = (blocks, draggedInfo) => {
      const { draggedItem, placeholderIndex, activeDragOverRow } = draggedInfo;
      const updatedChildren = [...blocks];
      const placeholder = { id: "placeholder", text: "" };
  
      if (placeholderIndex < 0) {
        updatedChildren.unshift(placeholder);
      } else {
        updatedChildren.splice(
          draggedItem.index < placeholderIndex &&
            draggedItem.parentId === activeDragOverRow
            ? placeholderIndex + 1
            : placeholderIndex,
          0,
          placeholder
        );
      }
      return updatedChildren;
    };

    const getColumnBlock = (rowDragOverActive, block, draggedInfo) =>
    rowDragOverActive ? addPlaceholderHelper(block, draggedInfo) : block;

    const draggableBlock = blocks.slice(0,-1);
    const groupedCards = groupCardRowWise(draggableBlock);
    const cardRowKeys = Object.keys(groupedCards);
    const [addBlock] = blocks.slice(-1)

    const draggableBlocks = (draggedInfo, row) => {
      return getColumnBlock(
        row === draggedInfo.activeDragOverRow,
        groupedCards[row],
        draggedInfo
      ).map((block, index) => (
        <Draggable
          key={block.id}
          item={block}
          index={index}
          parent={row}
          clientXRef={clientXRef}
        >
          <Block 
            onHandleMenuAction={onHandleMenuAction}
            blockId={block.id}
            store={store}
            onReturnKeyPressed={async _ => await onReturnKeyPressed(block)} />
        </Draggable>
      ));
    };
    
    return <div className='page'>
      <DragAndDropWrapper>
        {cardRowKeys.map((row) => (
          <Droppable
            key={row}
            rowId={row}
            rowBlock={groupedCards[row]}
            handleDrop={handleDropBlock}
          >
            {(draggedInfo) => draggableBlocks(draggedInfo, row)}
        </Droppable>
        ))}
      </DragAndDropWrapper>

    {/* This is block is render out of  DragAndDropWrapper as it is a last block which is for adding new block and is not draggable as well*/}
      {addBlock && 
        <Block
          onHandleMenuAction={onHandleMenuAction}
          blockId={addBlock.id}
          store={store}
          onReturnKeyPressed={async _ => await onReturnKeyPressed(addBlock)} 
        />
      }
    </div>
})

export {Page}