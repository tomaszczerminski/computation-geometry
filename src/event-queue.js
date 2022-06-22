import SplayTree from 'splaytree';

export default function eventQueue(byY) {
  const q = new SplayTree(byY);

  return {
    isEmpty: isEmpty,
    size: size,
    pop: pop,
    find: find,
    insert: insert
  }

  function find(p) {
    return q.find(p);
  }

  function size() {
    return q.size;
  }

  function isEmpty() {
    return q.isEmpty();
  }

  function insert(event) {
    q.add(event.point, event);
  }

  function pop() {
    const node = q.pop();
    return node && node.data;
  }
}
