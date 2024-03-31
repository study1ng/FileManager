def MRZ(length):
    result = []
    for k in range(length):
        if a[k] == 1:
            print(k, "番目の1")
            result.extend(pulse_forward)