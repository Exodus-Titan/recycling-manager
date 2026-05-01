import os
import pandas as pd
from datetime import datetime # <- Importamos datetime
from fpdf import FPDF, FontFace

class PDF(FPDF):
        
    def page_body(self, data):
        self.add_page()
        
        # --- FECHA EN LA ESQUINA SUPERIOR DERECHA ---
        # Obtenemos la fecha de hoy con el formato DD/MM/AAAA
        fecha_actual = datetime.now().strftime("%d/%m/%Y")
        
        # Guardamos la posición Y inicial para que el título quede en la misma línea
        y_inicial = self.get_y()
        
        self.set_font("helvetica", size=10)
        # Imprimimos la fecha alineada a la derecha (align="R")
        self.cell(0, 10, f"Fecha: {fecha_actual}", align="R")
        
        # Regresamos el cursor a la altura original para imprimir el título principal
        self.set_y(y_inicial)
        
        # 2. Título principal
        self.set_font("helvetica", style="B", size=12)
        self.cell(0, 10, "NOTA DE ENTREGA N. 007614", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(2) # Pequeño margen

        # 3. Configuramos los estilos de texto para las tablas
        font_bold = FontFace(emphasis="B")
        self.set_font("helvetica", size=9)

        # --- TABLA 1: DATOS DEL GENERADOR ---
        with self.table(col_widths=(30, 70), text_align="LEFT", padding=2) as table:
            row = table.row()
            row.cell("DATOS DEL GENERADOR DE DESECHOS", colspan=2, align="C", style=font_bold)
            
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
        with self.table(col_widths=(25, 45, 15, 15), text_align="LEFT", padding=2) as table:
            row = table.row()
            row.cell("IDENTIFICACIÓN DE LOS DESECHOS", colspan=4, align="C", style=font_bold)
            
            row = table.row()
            row.cell("MATERIAL", style=font_bold)
            row.cell(data['material'])
            row.cell("CANTIDAD", style=font_bold, align="C")
            row.cell(data['quantity'], align="C")

            row = table.row()
            row.cell("TIPO DE MATERIAL", style=font_bold)
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
        self.ln(5)
        self.set_font("helvetica", size=10)

        texto_legal = (
            "Según lo establecido en este manifiesto, el generador se compromete a declarar que el material de este lote "
            "otorgado al receptor es legítimo de acuerdo a lo establecido en documentos de propiedad, carta de "
            "responsabilidad o donación, otorgando la totalidad de estos desechos a COMERCIALIZADORA CORP METAL "
            "2271 C.A, para su traslado, corte, reciclaje, reutilización o procesamiento en el centro de acopio ubicado en "
            "la dirección de destino."
        )

        self.multi_cell(0, 5, texto_legal)
        self.ln(5)

        # Línea de conformidad sin firmas
        self.cell(0, 5, "Quedamos conforme a lo declarado:", new_x="LMARGIN", new_y="NEXT")
        self.ln(5)

        # Parámetros de la firma
        ancho_firma = 110
        alto_firma = 55
        x_centrado = (self.w - ancho_firma) / 2
        y_actual = self.get_y() + 2

        self.rect(x_centrado, y_actual, ancho_firma, alto_firma)

        sig_path = data.get('signature_path')
        if sig_path and os.path.exists(sig_path):
            self.image(sig_path, x=x_centrado + 2, y=y_actual + 2, w=ancho_firma - 4, h=alto_firma - 4)
        else:
            self.set_xy(x_centrado, y_actual + (alto_firma/2) - 2)
            self.cell(ancho_firma, 5, "FIRMA AQUÍ", align="C")

        self.set_xy(0, y_actual + alto_firma + 2)
        self.set_font("helvetica", "B", 8)
        self.cell(0, 5, "FIRMA DEL PROVEEDOR / GENERADOR", align="C")

    def generate_pdf(self, data_list):
        for data in data_list:
            self.page_body(data)
        
        return self.output()