import re
import json

# Read the FormCompositionItem.tsx file
with open('src/pages/compositions/FormCompositionItem.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the replacements for compositionItem keys
replacements = {
    't("compositionItem.loadError")': 't("compositions.compositionItem.loadError")',
    't("compositionItem.descriptionRequired")': 't("compositions.compositionItem.descriptionRequired")',
    't("compositionItem.itemSaved")': 't("compositions.compositionItem.itemSaved")',
    't("compositionItem.saveError")': 't("compositions.compositionItem.saveError")',
    't("compositionItem.itemDeleted")': 't("compositions.compositionItem.itemDeleted")',
    't("compositionItem.deleteError")': 't("compositions.compositionItem.deleteError")',
    't("compositionItem.composition")': 't("compositions.compositionItem.composition")',
    't("compositionItem.rawMaterial")': 't("compositions.compositionItem.rawMaterial")',
    't("compositionItem.select")': 't("compositions.compositionItem.select")',
    't("compositionItem.description")': 't("compositions.compositionItem.description")',
    't("compositionItem.descriptionPlaceholder")': 't("compositions.compositionItem.descriptionPlaceholder")',
    't("compositionItem.quantity")': 't("compositions.compositionItem.quantity")',
    't("compositionItem.unit")': 't("compositions.compositionItem.unit")',
    't("compositionItem.costType")': 't("compositions.compositionItem.costType")',
    't("compositionItem.unitCost")': 't("compositions.compositionItem.unitCost")',
    't("compositionItem.totalCost")': 't("compositions.compositionItem.totalCost")',
    't("compositionItem.serviceCost")': 't("compositions.compositionItem.serviceCost")',
    't("compositionItem.percentage")': 't("compositions.compositionItem.percentage")',
    't("compositionItem.active")': 't("compositions.compositionItem.active")',
    't("compositionItem.newItem")': 't("compositions.compositionItem.newItem")',
    't("compositionItem.loadingItems")': 't("compositions.compositionItem.loadingItems")',
    't("compositionItem.noItems")': 't("compositions.compositionItem.noItems")',
    't(`compositionItem.costTypes.${type}`)': 't(`compositions.compositionItem.costTypes.${type}`)',
    # Keep composition keys that should use compositionDetails
    't("composition.confirmDelete")': 't("compositions.compositionDetails.confirmDelete")',
    't("composition.yes")': 't("compositions.compositionDetails.yes")',
    't("composition.no")': 't("compositions.compositionDetails.no")',
    't("composition.update")': 't("compositions.compositionDetails.update")',
    't("composition.save")': 't("compositions.compositionDetails.save")',
    't("composition.cancel")': 't("compositions.compositionDetails.cancel")',
    't("composition.actions")': 't("compositions.compositionDetails.actions")',
    't("composition.edit")': 't("compositions.compositionDetails.edit")',
    't("composition.delete")': 't("compositions.compositionDetails.delete")'
}

# Apply replacements
for old, new in replacements.items():
    content = content.replace(old, new)

# Write the updated content back
with open('src/pages/compositions/FormCompositionItem.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("FormCompositionItem.tsx translations updated successfully!")

# Validate JSON structure
try:
    with open('public/locales/pt/principal.json', 'r', encoding='utf-8') as f:
        json.load(f)
    print("JSON file is valid!")
except json.JSONDecodeError as e:
    print(f"JSON validation error: {e}")