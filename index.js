const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000; 

app.use(bodyParser.json());

const warehouses = [
  { id: 'C1', distanceToL1: 3 },
  { id: 'C2', distanceToL1: 2.5 },
  { id: 'C3', distanceToL1: 2 },
];

const productStock = {
  C1: { A: 3, B: 2, C: 8 },
  C2: { D: 12, E: 25, F: 15 },
  C3: { G: 0.5, H: 1, I: 2 },
};

const costPerUnitDistance = 10;
const additionalCostPer5kg = 8;

function getMinDeliveryCost(order) {
    let cost=0;
    const full ={};
  for (const warehouse of warehouses) {
     const fulfilledItems = {};
      let fulfilledWeight = 0;
  for (const product in order) {

        if (productStock[warehouse.id] && productStock[warehouse.id][product]) {

  
          const quantityToFulfill = order[product];
          fulfilledItems[product] = quantityToFulfill;
  
          fulfilledWeight += quantityToFulfill * productStock[warehouse.id][product];
        }
      }
      if(fulfilledWeight>0){
      full[warehouse.id]=fulfilledWeight
      }
  }
  
  const warehouseIdsInCost = Object.keys(full);
  
  const nonZeroWarehouses = warehouses.filter(warehouse => warehouseIdsInCost.includes(warehouse.id));
  
  nonZeroWarehouses.sort((a, b) => b.distanceToL1 - a.distanceToL1);
  
  const maxDistanceWarehouse = nonZeroWarehouses[0];
  
  
  const restWarehouses = nonZeroWarehouses.filter(warehouse => warehouse.id !== maxDistanceWarehouse.id);
  
  const totalDistanceFromRest = restWarehouses.reduce((acc, warehouse) => acc + warehouse.distanceToL1, 0);
  for(const weight in full){
      const distance = warehouses.find(warehouse => warehouse.id === weight).distanceToL1;
      console.log(full[weight],'as')
      if (full[weight] > 0 && full[weight] <= 5){
      
        cost+=10*distance
        console.log(cost,weight, full[weight])
      }
      else if(full[weight]>5){
   
            cost+=((costPerUnitDistance+(Math.ceil((full[weight]-5)/5)*additionalCostPer5kg))*distance);
                  console.log(cost,weight, full[weight], distance)
      console.log(((costPerUnitDistance+(Math.ceil((full[weight]-5)/5)*additionalCostPer5kg))*distance))
  
          }
  
  }
  
    cost+=totalDistanceFromRest*costPerUnitDistance
  
  

  return { cost: cost };
}

app.post('/', (req, res) => {
  const order = req.body;

  if (!order) {
    
    res.status(400).send({ message: 'Invalid request: Missing order data' });
    return;
  }
  
  try {
    const { cost } = getMinDeliveryCost(order);
    console.log(cost)
    res.json({ cost});
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
});
  
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
  