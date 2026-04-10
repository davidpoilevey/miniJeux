// hooks/useInventory.js
import { useState, useCallback } from 'react';

const useInventory = (initialItems = []) => {
  const [items, setItems] = useState(initialItems);

  const addItem = useCallback((item) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeItem = useCallback((item) => {
    setItems(prev => {
      const index = prev.indexOf(item);
      if (index === -1) return prev;
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  }, []);

  const hasItem = useCallback((item, nb) => {
    if(nb!=null){
      return items.filter(x => x==item).length>=nb
    }
    return items.includes(item);
  }, [items]);

  const clearInventory = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    addItem,
    removeItem,
    hasItem,
    clearInventory
  };
};

export default useInventory;
