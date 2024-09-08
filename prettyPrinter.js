export function generateSolidityCode(ast) {
  const contractDef = ast.children.find(child => child.type === 'ContractDefinition');
  if (!contractDef) {
    console.log("No contract definition found in AST");
    return '';
  }

  const contractParts = [
    generatePragma(ast),
    generateContractHeader(contractDef),
    ...contractDef.subNodes.map(generateNode),
    '}'
  ];

  // console.log("Contract Parts: " + contractParts);

  try {
    const result = contractParts.join('\n\n');
    return result;
  } catch (error) {
    console.error("Error joining contract parts:", error);
    return '';
  }
}

function generatePragma(ast) {
  const pragmaDirective = ast.children.find(child => child.type === 'PragmaDirective' && child.name === 'solidity');
  if (pragmaDirective) {
    return `pragma solidity ${pragmaDirective.value};`;
  }
  // fallback to a default version if not found in AST
  return 'pragma solidity ^0.8.0;';
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

// function generateFunction(node) {
//   const params = node.parameters ? node.parameters.map(p => `${p.typeName.name} ${p.name}`).join(', ') : '';
//   const visibility = node.visibility || 'public';
//   const stateMutability = node.stateMutability ? ` ${node.stateMutability}` : '';
//   const returns = node.returnParameters && node.returnParameters.length > 0 ?
//     ` returns (${node.returnParameters.map(p => p.typeName.name).join(', ')})` : '';

//   return `    function ${node.name}(${params}) ${visibility}${stateMutability}${returns} {
//         // Function body
//     }`;
// }

function generateFunction(node) {
  console.log("In generateFunction function")

  const params = node.parameters ? node.parameters.map(p => `${p.typeName.name} ${p.name}`).join(', ') : '';
  const visibility = node.visibility || 'public';
  const stateMutability = node.stateMutability ? ` ${node.stateMutability}` : '';
  const returns = node.returnParameters && node.returnParameters.length > 0 ?
    ` returns (${node.returnParameters.map(p => p.typeName.name).join(', ')})` : '';

  let body = '';
  if (node.body && node.body.statements) {
    body = node.body.statements.map(stmt => '        ' + generateStatement(stmt)).join('\n');
  }

  return `    function ${node.name}(${params}) ${visibility}${stateMutability}${returns} {
${body}
    }`;
}


function generateStatement(statement) {
  switch (statement.type) {
    case 'ExpressionStatement':
      return generateExpression(statement.expression) + ';';
    case 'ReturnStatement':
      return `return ${generateExpression(statement.expression)};`;
    // add more cases as needed
    default:
      return `// Unsupported statement type: ${statement.type}`;
  }
}

function generateExpression(expression) {
  switch (expression.type) {
    case 'BinaryOperation':
      return `${generateExpression(expression.left)} ${expression.operator} ${generateExpression(expression.right)}`;
    case 'Identifier':
      return expression.name;
    // add more cases as needed
    default:
      return `/* Unsupported expression type: ${expression.type} */`;
  }
}
