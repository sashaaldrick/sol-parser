import parser from '@solidity-parser/parser';
import fs from 'fs';
import { generateSolidityCode } from './prettyPrinter';

console.log("Generating AST from Solidity input file...");
const filePath = './input.sol'
const fileContent = fs.readFileSync(filePath, 'utf8')

try {
  const ast = parser.parse(fileContent)
  print_ast(ast)
  console.log(JSON.stringify(ast, null, 2))
  
  console.log("====================================")
  console.log("Generating Solidity code from AST...")
  const generatedCode = generateSolidityCode(ast)
  console.log("Generated Code:", generatedCode);
  if (generatedCode) {
    fs.writeFileSync('./output.sol', generatedCode, 'utf8');
    console.log("File written successfully to ./output.sol");
  } else {
    console.log("No code generated, skipping file write");
  }
} catch (e) {
  console.error("Error:", e);
  if (e instanceof parser.ParserError) {
    console.error("Parser errors:", e.errors)
  }
}

function print_ast(ast) {
  // console.log("Printing AST function as JSON: ")
  // console.log(JSON.stringify(ast, null, 2));
  
  // find the contract definition
  const contractDef = ast.children.find(child => child.type === 'ContractDefinition');
  
  if (contractDef) {
    console.log("====================================")
    console.log("AST: ")
    console.log("Contract Name: " + contractDef.name)
    
    // iterate through subnodes
    contractDef.subNodes.forEach((node, index) => {
      console.log(`Node ${index}:`, node.type)
      
      if (node.type === 'StateVariableDeclaration') {
        console.log('Variable:', node.variables[0].name)
        console.log('Type:', node.variables[0].typeName.name)
      } else if (node.type === 'FunctionDefinition') {
        console.log('Function:', node.name)
        console.log('Parameters:', node.parameters.map(p => p.name).join(', '))
        console.log('Visibility:', node.visibility)
        if (node.stateMutability) {
          console.log('State Mutability:', node.stateMutability)
        }
      }
    })
  } else {
    console.log("No contract definition found")
  }
}

/// INPUT.SOL

// pragma solidity 0.8.20;

// /**
//  * @title Storage
//  * @dev Store & retrieve value in a variable
//  * @custom:dev-run-script ./scripts/deploy_with_ethers.ts
//  */
// contract Storage {

//     uint256 number;

//     /**
//      * @dev Store value in variable
//      * @param num value to store
//      */
//     function store(uint256 num) public {
//         number = num;
//     }

//     /**
//      * @dev Return value 
//      * @return value of 'number'
//      */
//     function retrieve() public view returns (uint256){
//         return number;
//     }
// }