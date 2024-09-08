export function generateSolidityCode(ast) {
  const contractDef = ast.children.find(child => child.type === 'ContractDefinition');
  if (!contractDef) {
    console.log("No contract definition found in AST");
    return '';
  }

  const contractParts = [
    generatePragma(),
    generateContractHeader(contractDef),
    ...contractDef.subNodes.map(generateNode),
    '}'
  ];
  
  // console.log("Contract Parts: " + contractParts);
  
  try {
    const result = contractParts.join('\n\n');
    console.log("Generated Solidity Code:", result);
    return result;
  } catch (error) {
    console.error("Error joining contract parts:", error);
    return '';
  }
}

function generatePragma() {
  return 'pragma solidity 0.8.20;';
}

function generateContractHeader(contractDef) {
  return `contract ${contractDef.name} {`;
}

function generateNode(node) {
  switch (node.type) {
    case 'StateVariableDeclaration':
      return generateStateVariable(node);
    case 'FunctionDefinition':
      return generateFunction(node);
    default:
      return '// Unsupported node type: ' + node.type;
  }
}

function generateStateVariable(node) {
  const variable = node.variables[0];
  return `    ${variable.typeName.name} ${variable.name};`;
}

function generateFunction(node) {
  const params = node.parameters ? node.parameters.map(p => `${p.typeName.name} ${p.name}`).join(', ') : '';
  const visibility = node.visibility || 'public';
  const stateMutability = node.stateMutability ? ` ${node.stateMutability}` : '';
  const returns = node.returnParameters && node.returnParameters.length > 0 ? 
    ` returns (${node.returnParameters.map(p => p.typeName.name).join(', ')})` : '';
  
  return `    function ${node.name}(${params}) ${visibility}${stateMutability}${returns} {
        // Function body
    }`;
}