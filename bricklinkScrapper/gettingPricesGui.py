import xml.etree.ElementTree as et
import pandas as pd
import os
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
import time
from statistics import mean
import urllib.parse
import tkinter as tk
from tkinter import filedialog as fd
import logging
import shutil
from PIL import Image

logging.basicConfig(format='%(asctime)s - %(message)s', level=logging.INFO, datefmt='%H:%M:%S')

gui = tk.Tk()
gui.title("Getting prices")

#centering window
window_height = 350
window_width = 370

screen_width = gui.winfo_screenwidth()
screen_height = gui.winfo_screenheight()

x_cordinate = int((screen_width/2) - (window_width/2))
y_cordinate = int((screen_height/2) - (window_height/2))

gui.geometry("{}x{}+{}+{}".format(window_width, window_height, x_cordinate, y_cordinate))


filename = r""

def select_file():
    global filename

    filetypes = (
        ("CSV files", "*.xml"),
        ("All files", "*.*"),
        )

    selected_file = fd.askopenfilename(
        title = "",
        initialdir = "/",
        filetypes = filetypes,
        )

    filename = selected_file
    file_selection_label.config(text=selected_file[-55:])

def done():
    global filename
    time_to_sleep = int(sleep_time_entry.get())

    #setting XML file
    file = et.parse(filename)
    root = file.getroot()

    #creating directory for img, its deleted after adding imgs to excel
    directory = "bvjfpdauvb40848erbu43bf983"
    parent_directory = imgfolder_location_entry.get()
    path = os.path.join(parent_directory, directory)

    isExist = os.path.exists(path)

    if not isExist:
      os.makedirs(path)

    #data for saving and adding img to excel, current id is 1 beacause i need to start from saving in excel from second row
    current_id = 1
    id_list = []

    #startup pandas parameters
    img_list = []
    k_or_m_id = []
    bricks_urls = []
    lego_color_name = []
    k_or_m_quantity = []
    last_6_months_avg = []
    last_6_months_min = []
    last_6_months_max = []
    now_avg = []
    now_min = []
    now_max = []
    available = []
    poland_avg = []
    poland_min = []
    poland_max = []
    eu_avg = []
    eu_min = []
    eu_max = []
    quantity_6months = []
    quantity_pl = []
    quantity_eu = []
    quantity_all = []

    #setting selenium
    options = Options()
    options.add_argument("--headless")


    #getting colors id and names list
    color_values = []
    with open("./bricklinkScrapper/colors.txt", "r") as f:
        for i in range(0,200):
            text = f.readline()
            color_id = int(text.replace("\n","").split()[0])
            color_name = list(text.replace("\n","").split()[1:])
            name = ""
            for item in color_name:
                name += item + " "
            color_name = name[:-1]
            duo = color_id, color_name
            color_values.append(duo)
            color_list = dict(color_values)


    start_url = "https://www.bricklink.com/v2/catalog/catalogitem.page?"

    value = brick_status_selection_chosen.get()
    if value == 1:
        lego_status = "U"
    else:
        lego_status = "N"

    for item in root:
        current_id +=1
        id_list.append(current_id)
        lego_id = item[1].text
        lego_type = item[0].text

        brick_url = start_url + lego_type + "=" + lego_id

        if lego_type == "M":
            #setting proper values for minifigure
            lego_quantity = item[3].text
            item_color_name = "-"

            final_url = start_url + lego_type + '=' + lego_id + '#T=P'

        else:
            #setting proper values for normal brick
            brick_color_id = item[2].text
            item_color_name = color_list[int(item[2].text)]
            lego_quantity = item[4].text

            final_url = start_url + lego_type + '=' + lego_id + '&C=' + brick_color_id + '#T=P&C=' + brick_color_id

        bricks_urls.append(final_url)
        logging.info(f'checking brick with id: {lego_id}, url to brick\' site {final_url}')

        #reading bricks data from "price guide"

        logging.info(f'Getting data from "price guide"')

        driver = webdriver.Firefox(options=options)
        driver.get(final_url)

        time.sleep(time_to_sleep)

        soup = BeautifulSoup(driver.page_source, 'lxml')

        if lego_status == "U":
            table_id = 1
        else:
            table_id = 0

        price_tables = soup.find_all(class_ = "pcipgSummaryTable")
        last_6_used = price_tables[table_id].find_all("b")
        if len(last_6_used[2].text)>1:
            if last_6_used[2].text.split()[1][0] == "$":
                last_6_months_min.append(float(last_6_used[2].text.split()[1][1:]))
                last_6_months_avg.append(float(last_6_used[3].text.split()[1][1:]))
                last_6_months_max.append(float(last_6_used[5].text.split()[1][1:]))
            else:
                last_6_months_min.append(float(last_6_used[2].text.split()[1]))
                last_6_months_avg.append(float(last_6_used[3].text.split()[1]))
                last_6_months_max.append(float(last_6_used[5].text.split()[1]))
        else:
            last_6_months_min.append("-")
            last_6_months_avg.append("-")
            last_6_months_max.append("-")

        current_used = price_tables[table_id+2].find_all("b")
        if len(current_used[2].text)>1:
            if current_used[2].text.split()[1][0] == "$":
                now_min.append(float(current_used[2].text.split()[1][1:]))
                now_avg.append(float(current_used[3].text.split()[1][1:]))
                now_max.append(float(current_used[5].text.split()[1][1:]))
            else:
                now_min.append(float(current_used[2].text.split()[1]))
                now_avg.append(float(current_used[3].text.split()[1]))
                now_max.append(float(current_used[5].text.split()[1]))
        else:
            now_min.append("-")
            now_avg.append("-")
            now_max.append("-")

        available.append(float(current_used[0].text))
        k_or_m_id.append(lego_id)
        lego_color_name.append(item_color_name)
        k_or_m_quantity.append(float(lego_quantity))

        #downloading product photo from same page
        soup = BeautifulSoup(driver.page_source, 'lxml')
        img = soup.find("img", id="_idImageMain")['src']
        urllib.request.urlretrieve("https:" + img, path + "/" + str(current_id) + ".jpg")

        driver.close()

        #reading bricks data from "items for sale"


        logging.info(f'Getting data from "items for sale"')

        locations = ['"loc":"PL",', '"reg":"-1",']
        for location in locations:
            table_of_prices = []
            #checking number of items for sale in location
            if lego_type == "M":
                item_ammount_url = start_url + lego_type + '=' + lego_id + '#T=S&O={"st":"5","cond":"' + lego_status + '",' + location + '"rpp":"500","iconly":0}'
                item_ammount_url = urllib.parse.quote(item_ammount_url, safe=":/?=#&{}")
            else:
                item_ammount_url = start_url + lego_type + '=' + lego_id + '&C=' + brick_color_id + '#T=S&C=' + brick_color_id + '&O={"color":"' + brick_color_id + '","st":"5","cond":"' + lego_status + '",' + location + '"rpp":"500","iconly":0}'
                item_ammount_url = urllib.parse.quote(item_ammount_url, safe=":/?=#&")

            #checking number of items and check nuber of pages
            driver = webdriver.Firefox(options=options)
            driver.get(item_ammount_url)

            time.sleep(time_to_sleep)

            soup = BeautifulSoup(driver.page_source, 'lxml')
            items_found = soup.find(id="_idtxtTotalFound")
            num_of_products = int(items_found.text.split()[0].replace(",",""))
            num_of_pages = num_of_products//500+1

            driver.close()

            if num_of_pages == 1:
                if lego_type == "M":
                    final_url = start_url + lego_type + '=' + lego_id + '#T=S&O={"st":"5","cond":"' + lego_status + '",' + location + '"rpp":"500","iconly":0}'
                    final_url = urllib.parse.quote(final_url, safe=":/?=#&{}")
                else:
                    final_url = start_url + lego_type + '=' + lego_id + '&C=' + brick_color_id + '#T=S&C=' + brick_color_id + '&O={"color":"' + brick_color_id + '","st":"5","cond":"' + lego_status + '",' + location + '"rpp":"500","iconly":0}'
                    final_url = urllib.parse.quote(final_url, safe=":/?=#&")

                driver = webdriver.Firefox(options=options)
                driver.get(final_url)

                time.sleep(time_to_sleep)

                soup = BeautifulSoup(driver.page_source, 'lxml')
                prices_table = soup.find("table", class_="pciItemTable")
                prices = prices_table.find_all("tr")

                table_of_prices=[]

                for tr in prices[2:-1]:
                    item = tr.find_all("td")

                    price = item[-1].text.split()[1]
                    table_of_prices.append(price)

                driver.close()
            else:
                current_page = 1
                while current_page <= num_of_pages:
                    if lego_type == "M":
                        final_url = start_url + lego_type + '=' + lego_id + '#T=S&&O={"st":"5","cond":"' + lego_status + '",' + location + '"rpp":"500","pi":"' + str(current_page) + '","iconly":0}'
                        final_url = urllib.parse.quote(final_url, safe=":/?=#&{}")
                    else:
                        final_url = start_url + lego_type + '=' + lego_id + '&C=' + brick_color_id + '#T=S&C=' + brick_color_id + '&O={"color":"' + brick_color_id + '","st":"5","cond":"' + lego_status + '",' + location + '"rpp":"500","pi":"' + str(current_page) + '","iconly":0}'
                        final_url = urllib.parse.quote(final_url, safe=":/?=#&")

                    current_page += 1

                    driver = webdriver.Firefox(options=options)
                    driver.get(final_url)

                    time.sleep(time_to_sleep)

                    soup = BeautifulSoup(driver.page_source, 'lxml')
                    prices_table = soup.find("table", class_="pciItemTable")
                    prices = prices_table.find_all("tr")

                    for tr in prices[3:-2]:
                        item = tr.find_all("td")
                        price = item[-1].text.split()[1]
                        table_of_prices.append(price)
                    driver.close()

            if table_of_prices == []:
                min_price = "-"
                max_price = "-"
                avg_price = "-"
            else:
                if table_of_prices[0][0] == "$":
                    table_of_prices = [price[1:] for price in table_of_prices]
                table_of_prices = [float(price) for price in table_of_prices]
                min_price = float(min(table_of_prices))
                max_price = float(max(table_of_prices))
                avg_price = float(mean(table_of_prices))

            if location == '"loc":"PL",':
                poland_avg.append(avg_price)
                poland_min.append(min_price)
                poland_max.append(max_price)
            else:
                eu_avg.append(avg_price)
                eu_min.append(min_price)
                eu_max.append(max_price)

        data_id = len(k_or_m_quantity)-1
        if last_6_months_avg[data_id] == "-":
            quantity_6months.append("-")
        else:
            quantity_6months.append(k_or_m_quantity[data_id] * last_6_months_avg[data_id])
        if poland_avg[data_id] == "-":
            quantity_pl.append("-")
        else:
            quantity_pl.append(k_or_m_quantity[data_id] * poland_avg[data_id])
        if eu_avg[data_id] == "-":
            quantity_eu.append("-")
        else:
            quantity_eu.append(k_or_m_quantity[data_id] * eu_avg[data_id])
        if now_avg[data_id] == "-":
            quantity_all.append("-")
        else:
            quantity_all.append(k_or_m_quantity[data_id] * now_avg[data_id])
        img_list.append("")


    logging.info(f'Generating file to save in excel.')

    #setting data to save in .csv file
    data = {
        "Product\'s img" : img_list,
        "Brick/minifigure id" : k_or_m_id,
        "Url to brick\'s site" : bricks_urls,
        "Brick\'s color" : lego_color_name,
        "Number of bricks/minifigures" : k_or_m_quantity,
        "Availability": available,
        "Average price from last 6 months": last_6_months_avg,
        "Minimum price from last 6 months": last_6_months_min,
        "Maksimum price from last 6 months": last_6_months_max,
        "Average price of current sales": now_avg,
        "Minimum price of current sales": now_min,
        "Maksimum price of current sales": now_max,
        "Average price in Poland": poland_avg,
        "Minimum price in Poland": poland_min,
        "Maksimum price in Poland": poland_max,
        "Average price in EU": eu_avg,
        "Minimum price in EU": eu_min,
        "Maksimum price in EU": eu_max,
        "num * average price from 6 months": quantity_6months,
        "num * average price in Poland": quantity_pl,
        "num * average price in EU": quantity_eu,
        "num * average world price": quantity_all
    }

    df = pd.DataFrame(data)

    #setting sum row
    df2 = df.sum(numeric_only=True)
    df2 = pd.DataFrame(df2)
    df_transposed = df2.transpose()
    columns = ["Product\'s img","Brick/minifigure id","Brick\'s color","Url to brick\'s site","Number of bricks/minifigures","Availability"]
    df_transposed.loc[0,columns] = "-"
    vertical = pd.concat([df, df_transposed])

    finalpath = final_location_entry.get()
    filename = file_name_entry.get()

    writer = pd.ExcelWriter(finalpath + "/" + filename, engine='xlsxwriter')

    os.chdir(finalpath)
    vertical.to_excel(writer, sheet_name='summary', index=False)

    #formating photos
    for img_id in id_list:
        image = Image.open(path + "/" + str(img_id) + ".jpg")
        image = image.convert('RGB')
        image.thumbnail((100, 100))
        image.save(path + "/" + str(img_id) + ".jpg")
        worksheet = writer.sheets['summary']

        worksheet.insert_image("A" + str(img_id), path + "/" + str(img_id) + ".jpg")

        worksheet.set_column("A:A", 15.43)
        worksheet.set_default_row(75)
        worksheet.set_row(0, 16.5)
    writer.close()
    logging.info(f'The file has been saved.')
    shutil.rmtree(path)
    status_label.config(text="The file has been saved, you can close the program.")

file_selection_button = tk.Button(
    gui,
    text = "Select the file from which the product list will be downloaded(.XML)",
    bg = "gray",
    command = select_file,
    )
file_selection_button.pack(fill=tk.X)
file_selection_label = tk.Label(
    gui,
    text = "",
    )
file_selection_label.pack()



brick_status_selection_label = tk.Label(
    gui,
    text="Should the bricks be used or new?"
    )
brick_status_selection_label.pack()
brick_status_selection_chosen = tk.IntVar(value=1)
brick_status_selection_yes = tk.Radiobutton(
    gui,
    text="Used",
    variable=brick_status_selection_chosen,
    value=1
    )
brick_status_selection_yes.pack(fill=tk.X)
brick_status_selection_no = tk.Radiobutton(
    gui,
    text="New",
    variable=brick_status_selection_chosen,
    value=2
    )
brick_status_selection_no.pack(fill=tk.X)



sleep_time_label = tk.Label(
    gui,
    text = "Enter the waiting time for pages to open (in seconds)",
    )
sleep_time_label.pack()
sleep_time_entry = tk.Entry(
    gui,
    )
sleep_time_entry.insert(0,"1")
sleep_time_entry.pack(fill=tk.X)

imgfolder_location_label = tk.Label(
    gui,
    text = "Specify where to create the temporary folder  ",
    )
imgfolder_location_label.pack()
imgfolder_location_label2 = tk.Label(
    gui,
    text = "to store photos, after saving the file it will be deleted",
    )
imgfolder_location_label2.pack()
imgfolder_location_entry = tk.Entry(
    gui,
    )
imgfolder_location_entry.insert(0,r"C:\\Users\\USER\\Desktop")
imgfolder_location_entry.pack(fill=tk.X)

end_location_label = tk.Label(
    gui,
    text = "Specify where to save the final file",
    )
end_location_label.pack()
final_location_entry = tk.Entry(
    gui,
    )
final_location_entry.insert(0,r"C:\Users\USER\Desktop")
final_location_entry.pack(fill=tk.X)

file_name_label = tk.Label(
    gui,
    text = "Enter the name of the final file",
    )
file_name_label.pack()
file_name_entry = tk.Entry(
    gui,
    )
file_name_entry.insert(0,r"file_name.xlsx")
file_name_entry.pack(fill=tk.X)

done_button = tk.Button(
    gui,
    text = "Confirm entered data",
    bg = "gray",
    command = done,
    )
done_button.pack(fill=tk.X)

status_label = tk.Label(
    gui,
    text = "",
    )
status_label.pack()

gui.mainloop()
