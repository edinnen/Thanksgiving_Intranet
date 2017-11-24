
# coding: utf-8

# In[44]:


import matplotlib.pyplot as plt
import numpy as np
import time
from random import randint


# In[45]:




# In[46]:




# In[61]:


def writeData():
    """
    This function will write data in JSON for sine values generated above
    """
    solar=randint(0,5)
    pelton=randint(6,11)
    battery=randint(12,17)

    file = 'scripts/data.json'
    string = '[{\"solar\": ' + str(solar) + ',\"pelton\": ' + str(pelton) + ',\"battery\": '  + str(battery) + '}]'
    with open(file, 'w') as out:
        out.write(string)

# In[64]:


end = time.time() + 60 * 1 # 60 seconds per minute
while time.time() < end:
    writeData()
    time.sleep(1)
