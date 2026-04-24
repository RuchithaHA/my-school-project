const memoryAdmissions = [];

const memorySeats = [
  ["Nursery", 40, 18],
  ["KG", 40, 12],
  ["Grade 1", 45, 15],
  ["Grade 2", 45, 10],
  ["Grade 3", 45, 8],
  ["Grade 4", 45, 13],
  ["Grade 5", 45, 14],
  ["Grade 6", 45, 9],
  ["Grade 7", 45, 11],
  ["Grade 8", 45, 7],
  ["Grade 9", 40, 6],
  ["Grade 10", 40, 5],
  ["Grade 11", 35, 9],
  ["Grade 12", 35, 4],
].map(([className, totalSeats, availableSeats], index) => ({
  _id: `seat-${index + 1}`,
  className,
  totalSeats,
  availableSeats,
}));

module.exports = {
  memoryAdmissions,
  memorySeats,
};
