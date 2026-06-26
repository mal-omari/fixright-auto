export const vehicleModels: Record<string, string[]> = {
  'Acura': ['ILX', 'TLX', 'RDX', 'MDX', 'NSX'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale'],
  'Audi': ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron', 'e-tron GT', 'RS3', 'RS5', 'S4'],
  'BMW': ['2 Series', '3 Series', '4 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'M3', 'M5', 'iX', 'i4', 'i7'],
  'Buick': ['Encore', 'Encore GX', 'Envision', 'Enclave'],
  'Cadillac': ['CT4', 'CT5', 'XT4', 'XT5', 'XT6', 'Escalade', 'Lyriq'],
  'Chevrolet': ['Silverado 1500', 'Silverado 2500', 'Colorado', 'Equinox', 'Traverse', 'Blazer', 'Trax', 'Trailblazer', 'Tahoe', 'Suburban', 'Camaro', 'Corvette', 'Malibu', 'Spark'],
  'Chrysler': ['300', 'Pacifica', 'Voyager'],
  'Dodge': ['Ram 1500', 'Charger', 'Challenger', 'Durango', 'Journey'],
  'Fiat': ['500', '500X', '500L'],
  'Ford': ['F-150', 'F-250', 'F-350', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Bronco', 'Bronco Sport', 'Maverick', 'EcoSport', 'Transit', 'Transit Connect', 'Ranger'],
  'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80'],
  'GMC': ['Sierra 1500', 'Sierra 2500', 'Canyon', 'Terrain', 'Acadia', 'Yukon', 'Yukon XL', 'Savana'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'Passport', 'Odyssey', 'Ridgeline', 'Fit', 'Insight'],
  'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Venue', 'Ioniq', 'Ioniq 5', 'Ioniq 6', 'Nexo'],
  'Infiniti': ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80'],
  'Jaguar': ['XE', 'XF', 'XJ', 'E-Pace', 'F-Pace', 'I-Pace', 'F-Type'],
  'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Grand Wagoneer'],
  'Kia': ['Forte', 'K5', 'Sportage', 'Sorento', 'Telluride', 'Soul', 'Seltos', 'Carnival', 'Stinger', 'EV6', 'Niro'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Velar', 'Range Rover Evoque'],
  'Lexus': ['IS', 'ES', 'GS', 'LS', 'NX', 'RX', 'GX', 'LX', 'UX', 'RC', 'LC'],
  'Lincoln': ['Corsair', 'Nautilus', 'Aviator', 'Navigator'],
  'Maserati': ['Ghibli', 'Quattroporte', 'Levante', 'Grecale'],
  'Mazda': ['Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-50', 'CX-9', 'MX-5 Miata', 'MX-30'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'CLA', 'E-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'S-Class', 'EQB', 'EQE', 'EQS'],
  'Mini': ['Cooper', 'Clubman', 'Countryman', 'Convertible'],
  'Mitsubishi': ['Outlander', 'Eclipse Cross', 'RVR', 'Mirage'],
  'Nissan': ['Altima', 'Sentra', 'Maxima', 'Rogue', 'Murano', 'Pathfinder', 'Armada', 'Frontier', 'Titan', 'Kicks', 'Versa', 'Leaf', 'Ariya'],
  'Polestar': ['Polestar 2'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  'Ram': ['1500', '2500', '3500', 'ProMaster', 'ProMaster City'],
  'Rivian': ['R1T', 'R1S'],
  'Smart': ['EQ fortwo'],
  'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'Ascent', 'WRX', 'BRZ', 'Solterra'],
  'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', '4Runner', 'Tacoma', 'Tundra', 'Sienna', 'Venza', 'C-HR', 'Prius', 'Avalon', 'Sequoia', 'GR86', 'Supra', 'bZ4X'],
  'Volkswagen': ['Jetta', 'Passat', 'Golf', 'GTI', 'Golf R', 'Tiguan', 'Atlas', 'Atlas Cross Sport', 'Taos', 'ID.4'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40'],
}

export const vehicleMakes = Object.keys(vehicleModels).sort()

const currentYear = new Date().getFullYear()
export const vehicleYears: number[] = Array.from(
  { length: currentYear - 1980 },
  (_, i) => currentYear - i
)
