import io
import pandas as pd
from datetime import datetime

def generate_excel_file(df_export: pd.DataFrame, user_map: dict, report_type: str):
    """
    Motor de reportes modular portado de admin_panel.py.
    Genera reportes en memoria (BytesIO) para evitar uso de disco.
    """
    output = io.BytesIO()
    
    # --- CORRECCIÓN DE ZONAS HORARIAS ---
    # Aseguramos que las fechas no tengan timezone para compatibilidad con Excel
    if 'created_at' in df_export.columns:
        df_export['created_at'] = pd.to_datetime(df_export['created_at'])
        if df_export['created_at'].dt.tz is not None:
            df_export['created_at'] = df_export['created_at'].dt.tz_localize(None)

    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        workbook = writer.book
        
        # --- DEFINICIÓN DE ESTILOS PROFESIONALES ---
        # Replicamos los estilos exactos definidos en el MVP original
        header_fmt = workbook.add_format({
            'bold': True, 'font_color': 'white', 'bg_color': '#1F4E78', 
            'border': 1, 'align': 'center', 'valign': 'vcenter', 'text_wrap': True
        })
        cell_fmt = workbook.add_format({'border': 1, 'align': 'left', 'valign': 'top', 'text_wrap': True}) 
        pct_fmt = workbook.add_format({'num_format': '0.0%', 'border': 1, 'align': 'center'})
        int_fmt = workbook.add_format({'num_format': '0', 'border': 1, 'align': 'center'}) 
        success_fmt = workbook.add_format({'bg_color': '#C6EFCE', 'font_color': '#006100', 'border': 1, 'num_format': '0.0%'})
        alert_fmt = workbook.add_format({'bg_color': '#FFC7CE', 'font_color': '#9C0006', 'border': 1, 'num_format': '0.0%'})

        agents = sorted(df_export['agent'].unique(), key=lambda x: str(x).lower())

        # =========================================================
        # TIPO 1: ESTRATÉGICO (KPIs & Negocio)
        # =========================================================
        if report_type == "Estratégico (KPIs & Negocio)":
            # Resumen de conversión por agente
            summary_data = []
            for ag in agents:
                ag_data = df_export[df_export['agent'] == ag]
                total = len(ag_data)
                # Lógica de detección de ventas: 'Completed' pero no 'Not Completed'
                comp = len(ag_data[ag_data['result'].str.contains('Completed', case=False, na=False) & 
                                 ~ag_data['result'].str.contains('Not', case=False, na=False)])
                conversion = comp / total if total > 0 else 0
                
                summary_data.append({
                    "AGENTE": user_map.get(ag, ag), "TOTAL": total, 
                    "VENTAS": comp, "CONVERSIÓN": conversion
                })
            
            df_sum = pd.DataFrame(summary_data).sort_values("CONVERSIÓN", ascending=False)
            df_sum.to_excel(writer, sheet_name='KPI Global', index=False)
            
            ws = writer.sheets['KPI Global']
            ws.set_tab_color('#1F4E78')
            for col_num, value in enumerate(df_sum.columns.values):
                ws.write(0, col_num, value, header_fmt)

            # Formato condicional de conversión (Meta > 10%)
            ws.conditional_format(f'D2:D{len(df_sum)+1}', {'type': 'cell', 'criteria': '>=', 'value': 0.10, 'format': success_fmt})
            ws.conditional_format(f'D2:D{len(df_sum)+1}', {'type': 'cell', 'criteria': '<', 'value': 0.05, 'format': alert_fmt})

        # =========================================================
        # TIPO 2: OPERATIVO (Desempeño & Detalle)
        # =========================================================
        elif report_type == "Operativo (Desempeño & Detalle)":
            # Hojas individuales por cada agente para auditoría profunda
            for ag in agents:
                df_ag = df_export[df_export['agent'] == ag].copy()
                t_status = df_ag['transfer_status'] if 'transfer_status' in df_ag.columns else '-'
                
                df_final = pd.DataFrame({
                    'FECHA': df_ag['created_at'].dt.strftime('%Y-%m-%d %H:%M'),
                    'ID': df_ag['cordoba_id'],
                    'ETAPA': df_ag['info_until'],
                    'RESULTADO': df_ag['result'],
                    'TRANSFERENCIA': t_status,
                    'COMENTARIOS': df_ag['comments']
                })
                
                sheet_name = str(user_map.get(ag, ag)).replace('/', '')[:30]
                df_final.to_excel(writer, sheet_name=sheet_name, index=False)
                ws_ag = writer.sheets[sheet_name]
                for col, val in enumerate(df_final.columns):
                    ws_ag.write(0, col, val, header_fmt)

        # =========================================================
        # TIPO 3: CALIDAD (Fricción & Errores)
        # =========================================================
        elif report_type == "Calidad (Fricción & Errores)":
            # Análisis de funnel de caídas
            if 'info_until' in df_export.columns:
                df_funnel = df_export['info_until'].value_counts().reset_index()
                df_funnel.columns = ['ETAPA', 'CANTIDAD']
                df_funnel.to_excel(writer, sheet_name='Funnel Caídas', index=False)
                ws_fun = writer.sheets['Funnel Caídas']
                ws_fun.set_tab_color('#C0392B')
                for col, val in enumerate(df_funnel.columns): ws_fun.write(0, col, val, header_fmt)

    return output