import pandas as pd
from fpdf import FPDF, FontFace

class PDF(FPDF):

    # data = {
    #     'name': '',
    #     'id_number': '',
    #     'address': '',
    #     'material': '',
    #     'quantity': '',
    #     'material_type': '',
    #     'receptor_name': '',
    #     'receptor_id_number': '',
    #     'receptor_address': ''
    # }

    # def fill_data(self, data):
    #     self.data['name'] = data.name
    #     self.data['id_number'] = data.id_number
    #     self.data['address'] = data.address
    #     self.data['material'] = data.material
    #     self.data['quantity'] = data.quantity
    #     self.data['material_type'] = data.material_type
    #     self.data['receptor_name'] = data.receptor_name
    #     self.data['receptor_id_number'] = data.receptor_id_number
    #     self.data['receptor_address'] = data.receptor_address
    #     return data
        
    def page_body(self, data):

        self.add_page()
        # 2. Título principal
        self.set_font("helvetica", style="B", size=12)
        # new_x y new_y mueven el cursor a la siguiente línea después de escribir
        self.cell(0, 10, "NOTA DE ENTREGA N. 007614", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(2) # Pequeño margen

        # 3. Configuramos los estilos de texto para las tablas
        font_bold = FontFace(emphasis="B")
        self.set_font("helvetica", size=9)

        # --- TABLA 1: DATOS DEL GENERADOR ---
        # Usamos col_widths en porcentajes (30% y 70%) para definir el ancho
        with self.table(col_widths=(30, 70), text_align="LEFT", padding=2) as table:
            # Fila de encabezado
            row = table.row()
            row.cell("DATOS DEL GENERADOR DE DESECHOS", colspan=2, align="C", style=font_bold)
            
            # Filas de datos
            row = table.row()
            row.cell("NOMBRE O RAZÓN SOCIAL", style=font_bold)
            row.cell(data['name'])
            
            row = table.row()
            row.cell("CÉDULA O RIF", style=font_bold)
            row.cell(data['id_number'])
            
            row = table.row()
            row.cell("DIRECCIÓN DE ORIGEN", style=font_bold)
            row.cell(data['address'])

        # --- TABLA 2: IDENTIFICACIÓN DE LOS DESECHOS ---
        # Aquí dividimos en 4 columnas (25%, 45%, 15%, 15%)
        with self.table(col_widths=(25, 45, 15, 15), text_align="LEFT", padding=2) as table:
            row = table.row()
            row.cell("IDENTIFICACIÓN DE LOS DESECHOS", colspan=4, align="C", style=font_bold)
            
            row = table.row()
            row.cell("MATERIAL", style=font_bold)
            row.cell(data['material'])
            row.cell("CANTIDAD (Kg)", style=font_bold, align="C")
            row.cell(data['quantity'], align="C")

            row = table.row()
            row.cell("TIPO DE MATERIAL", style=font_bold)
            # colspan=3 hace que esta celda ocupe el resto del ancho de la tabla
            row.cell(data['material_type'], colspan=3)

        # --- TABLA 3: DATOS DEL RECEPTOR ---
        with self.table(col_widths=(30, 70), text_align="LEFT", padding=2) as table:
            row = table.row()
            row.cell("DATOS DEL RECEPTOR", colspan=2, align="C", style=font_bold)
            
            row = table.row()
            row.cell("NOMBRE O RAZÓN SOCIAL", style=font_bold)
            row.cell(data['receptor_name'])
            
            row = table.row()
            row.cell("CÉDULA O RIF", style=font_bold)
            row.cell(data['receptor_id_number'])
            
            row = table.row()
            row.cell("DIRECCIÓN DE DESTINO", style=font_bold)
            row.cell(data['receptor_address'])

        # --- TEXTO LEGAL FINAL ---
        self.ln(5) # Salto de línea antes del párrafo
        self.set_font("helvetica", size=10)

        texto_legal = (
            "Según lo establecido en este manifiesto, el generador se compromete a declarar que el material de este lote "
            "otorgado al receptor es legítimo de acuerdo a lo establecido en documentos de propiedad, carta de "
            "responsabilidad o donación, otorgando la totalidad de estos desechos a COMERCIALIZADORA CORP METAL "
            "2271 C.A, para su traslado, corte, reciclaje, reutilización o procesamiento en el centro de acopio ubicado en "
            "la dirección de destino."
        )

        # multi_cell es ideal para párrafos largos porque hace el salto de línea automático
        self.multi_cell(0, 5, texto_legal)
        self.ln(5)

        # Línea de conformidad sin firmas
        self.cell(0, 5, "Quedamos conforme a lo declarado:", new_x="LMARGIN", new_y="NEXT")

    def generate_pdf(self, data_list):
        # Esta es la función iteradora
        # Por cada diccionario en tu lista, llama a page_body() y crea una página
        for data in data_list:
            # self.fill_data(data)
            self.page_body(data)
        
        # Una vez que termina el bucle, exporta el documento completo
        return self.output()
