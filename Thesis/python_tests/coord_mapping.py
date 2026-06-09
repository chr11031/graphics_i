def test(instance_id, vertex_id, width, height):

    unique_id = 3*instance_id + vertex_id
    print('\tUnique Id is :', unique_id)

    six_width = 6*(width-1)
    box_row = unique_id // six_width
    box_col = (unique_id % six_width) // 6
    print('Box Row is: ', box_row, 'Box Col is: ', box_col)

    step_size_x = 1.0 / (width)
    step_size_y = 1.0 / (height)
    first_coord = [0.5 * step_size_x + (step_size_x*box_col), 0.5 * step_size_y + (step_size_y*box_row)]

    second_coord = [0,0]
    third_coord = [0,0]
    box_rem = unique_id % 6
    if box_rem < 3:
        second_coord = [first_coord[0] + step_size_x, first_coord[1] + step_size_y]
        third_coord = [first_coord[0] + 0.0, first_coord[1] + step_size_y]
    else:  
        second_coord = [first_coord[0] + step_size_x, first_coord[1] + 0.0]
        third_coord = [first_coord[0] + step_size_x, first_coord[1] + step_size_y]

    print('First coord is: ', first_coord)
    print('Second coord is: ', second_coord)
    print('Third coord is: ', third_coord)


    if box_rem == 0 or box_rem == 3:
        print('I am: ', first_coord)
    elif box_rem == 1 or box_rem == 4:
        print('I am: ', second_coord)
    else:
        print('I am: ', third_coord)



width = 2
height = 2
test(1, 2, width, height)
print('====DONE====')